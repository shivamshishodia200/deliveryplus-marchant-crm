// Standalone types matching schema definitions (avoids missing @prisma/client dependency error)
export type TaskStatus =
  | 'UNASSIGNED'
  | 'ASSIGNING'
  | 'ASSIGNED'
  | 'PROCESSED'
  | 'LOADED'
  | 'TRANSIT'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type UserRole = 'SUPER_ADMIN' | 'DISPATCHER' | 'DRIVER' | 'MERCHANT_ADMIN' | 'MERCHANT_STAFF';
export type ShiftStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ABSENT';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface DriverCandidate {
  id: string;
  name: string;
  currentLat: number;
  currentLng: number;
  maxCapacity: number;
  activePackageCount: number;
  batteryLevel?: number;
  isOnline: boolean;
  activeShift?: {
    id: string;
    shiftDate: Date;
    startTime: string; // Supports "07:00", "07:00 AM", "03:30 PM"
    endTime: string;
  };
}

export interface DispatchTask {
  id: string;
  destinationLat: number;
  destinationLng: number;
  completeBeforeTime?: Date | null;
  itemsCount: number;
  weightKg: number;
}

export interface AssignmentResult {
  taskId: string;
  driverId: string;
  distanceKm: number;
  estimatedEtaMinutes: number;
}

export interface DispatchEngineOptions {
  earthRadiusKm?: number;
  averageCitySpeedKmh?: number;
  trafficBufferMinutes?: number;
}

export class AutoDispatchEngine {
  private readonly earthRadiusKm: number;
  private readonly averageCitySpeedKmh: number;
  private readonly trafficBufferMinutes: number;

  constructor(options: DispatchEngineOptions = {}) {
    this.earthRadiusKm = options.earthRadiusKm ?? 6371.0;
    this.averageCitySpeedKmh = options.averageCitySpeedKmh ?? 35.0; // km/h
    this.trafficBufferMinutes = options.trafficBufferMinutes ?? 10;
  }

  /**
   * Helper: Parses time strings ("07:30", "07:30 AM", "04:30 PM") into minutes from midnight
   */
  private parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const cleanStr = timeStr.trim().toUpperCase();
    const isPM = cleanStr.includes('PM');
    const isAM = cleanStr.includes('AM');
    const timeOnly = cleanStr.replace(/[^\d:]/g, '');
    const [rawHour, rawMin] = timeOnly.split(':').map((val) => parseInt(val, 10) || 0);

    let hour = rawHour;
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return hour * 60 + rawMin;
  }

  /**
   * Calculates Great-Circle distance using Haversine formula
   */
  public calculateDistance(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    const toRadians = (degree: number) => (degree * Math.PI) / 180.0;

    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLng = toRadians(coord2.lng - coord1.lng);

    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.earthRadiusKm * c;
  }

  /**
   * Verifies if driver's scheduled roster shift is active right now
   * Supports both 24-hour ("14:00") and 12-hour AM/PM formats ("02:00 PM")
   */
  public isShiftActive(driver: DriverCandidate, currentTime: Date = new Date()): boolean {
    if (!driver.activeShift) return false;

    const startMinutes = this.parseTimeToMinutes(driver.activeShift.startTime);
    const endMinutes = this.parseTimeToMinutes(driver.activeShift.endTime);
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Normal shift (e.g. 07:00 to 17:00)
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    // Overnight shift (e.g. 22:00 to 06:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  /**
   * Evaluates available drivers against shift, capacity, and proximity constraints
   */
  public findOptimalDriverForTask(
    task: DispatchTask,
    drivers: DriverCandidate[],
    maxSearchRadiusKm: number = 25.0
  ): { driver: DriverCandidate; distanceKm: number; etaMinutes: number } | null {
    const eligibleDrivers = drivers.filter((driver) => {
      // Constraint 1: Driver must be marked online
      if (!driver.isOnline) return false;

      // Constraint 2: Driver must be on an active roster shift
      if (!this.isShiftActive(driver)) return false;

      // Constraint 3: Driver capacity must not be exceeded
      const remainingCapacity = driver.maxCapacity - driver.activePackageCount;
      if (remainingCapacity < task.itemsCount) return false;

      // Constraint 4: Battery level check for telematics devices (must be > 10%)
      if (driver.batteryLevel !== undefined && driver.batteryLevel < 10) return false;

      // Constraint 5: Valid coordinates
      if (driver.currentLat === null || driver.currentLng === null) return false;

      return true;
    });

    if (eligibleDrivers.length === 0) return null;

    let bestMatch: { driver: DriverCandidate; distanceKm: number; etaMinutes: number } | null = null;
    let minDistance = Infinity;

    for (const driver of eligibleDrivers) {
      const distance = this.calculateDistance(
        { lat: driver.currentLat, lng: driver.currentLng },
        { lat: task.destinationLat, lng: task.destinationLng }
      );

      if (distance <= maxSearchRadiusKm && distance < minDistance) {
        minDistance = distance;
        const etaMinutes =
          Math.round((distance / this.averageCitySpeedKmh) * 60) + this.trafficBufferMinutes;

        bestMatch = {
          driver,
          distanceKm: Math.round(distance * 100) / 100,
          etaMinutes
        };
      }
    }

    return bestMatch;
  }

  /**
   * Batch auto-assignment runner for unassigned order queues
   */
  public executeBatchDispatch(
    unassignedTasks: DispatchTask[],
    activeDrivers: DriverCandidate[]
  ): AssignmentResult[] {
    const assignments: AssignmentResult[] = [];
    const localDriversState = activeDrivers.map((d) => ({ ...d }));

    // Sort tasks by priority: earliest completion deadline first
    const sortedTasks = [...unassignedTasks].sort((a, b) => {
      if (!a.completeBeforeTime) return 1;
      if (!b.completeBeforeTime) return -1;
      return a.completeBeforeTime.getTime() - b.completeBeforeTime.getTime();
    });

    for (const task of sortedTasks) {
      const match = this.findOptimalDriverForTask(task, localDriversState);

      if (match) {
        assignments.push({
          taskId: task.id,
          driverId: match.driver.id,
          distanceKm: match.distanceKm,
          estimatedEtaMinutes: match.etaMinutes
        });

        // Update driver's load in local queue state
        match.driver.activePackageCount += task.itemsCount;
      }
    }

    return assignments;
  }
}
