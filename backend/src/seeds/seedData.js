import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { Contact } from '../models/Contact.js';
import { Company } from '../models/Company.js';
import { Opportunity } from '../models/Opportunity.js';
import { Product } from '../models/Product.js';
import { Quotation } from '../models/Quotation.js';
import { Task } from '../models/Task.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { Setting } from '../models/Setting.js';
import { Merchant } from '../models/Merchant.js';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Purging legacy CRM data collections for clean seed...');

    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      Contact.deleteMany({}),
      Company.deleteMany({}),
      Opportunity.deleteMany({}),
      Product.deleteMany({}),
      Quotation.deleteMany({}),
      Task.deleteMany({}),
      SupportTicket.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Setting.deleteMany({}),
      Merchant.deleteMany({})
    ]);

    logger.info('Inserting Organization Settings...');
    await Setting.create({
      organizationName: 'Nexus Enterprise CRM',
      organizationLogo: '/logo.svg',
      currency: 'USD',
      currencySymbol: '$',
      taxRatePercent: 5
    });

    logger.info('Seeding staff user accounts...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@enterprise-crm.com',
      password: 'EnterpriseCRM2026!',
      role: 'superadmin',
      department: 'Executive',
      phone: '+1 (555) 019-2834'
    });

    const manager = await User.create({
      name: 'Marcus Vance',
      email: 'manager@enterprise-crm.com',
      password: 'EnterpriseCRM2026!',
      role: 'manager',
      department: 'Sales & Operations',
      phone: '+1 (555) 014-9988'
    });

    const salesRep = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.sales@enterprise-crm.com',
      password: 'EnterpriseCRM2026!',
      role: 'sales_rep',
      department: 'Enterprise Sales',
      phone: '+1 (555) 017-3321'
    });

    const supportAgent = await User.create({
      name: 'Alex Rivera',
      email: 'support@enterprise-crm.com',
      password: 'EnterpriseCRM2026!',
      role: 'support_agent',
      department: 'Customer Success',
      phone: '+1 (555) 018-7744'
    });

    logger.info('Seeding enterprise products & price book...');
    const products = await Product.create([
      {
        name: 'Enterprise Cloud License (Annual Tier)',
        sku: 'LIC-ENT-ANNUAL',
        category: 'Enterprise Software',
        unitPrice: 4800,
        taxRate: 5,
        description: 'Annual enterprise multi-seat subscription with dedicated VPC, SOC-2 compliance, and 99.99% uptime SLA'
      },
      {
        name: 'Dedicated Solutions Architect & Onboarding',
        sku: 'SVC-SOL-ARCH',
        category: 'Professional Services',
        unitPrice: 3500,
        taxRate: 5,
        description: 'Comprehensive workflow design, custom data mapping, schema migration, and team training'
      },
      {
        name: '24/7 Mission-Critical SLA Support (Monthly)',
        sku: 'SPT-SLA-GOLD',
        category: 'Support & Maintenance',
        unitPrice: 850,
        taxRate: 5,
        description: 'Priority incident triage with 15-minute SLA, dedicated TAM, and monthly health reviews'
      },
      {
        name: 'Custom REST API & Webhook Integration Suite',
        sku: 'SVC-API-SUITE',
        category: 'Custom Engineering',
        unitPrice: 2200,
        taxRate: 5,
        description: 'Bi-directional middleware sync between ERP, financial systems, and CRM endpoints'
      }
    ]);

    logger.info('Seeding enterprise corporate accounts...');
    const companies = await Company.create([
      {
        name: 'Horizon Financial Group',
        industry: 'Banking & Financial Services',
        website: 'https://horizonfinancial.example.com',
        phone: '+1 (800) 555-0144',
        address: { street: '100 Wall Street', city: 'New York', state: 'NY', postalCode: '10005', country: 'USA' },
        annualRevenue: 45000000,
        employeeCount: 1200,
        tier: 'platinum',
        status: 'active_client',
        owner: salesRep._id
      },
      {
        name: 'Apex Global Technologies',
        industry: 'Enterprise Software & Cloud',
        website: 'https://apextech.example.com',
        phone: '+1 (800) 555-0182',
        address: { street: '450 Silicon Way', city: 'San Francisco', state: 'CA', postalCode: '94107', country: 'USA' },
        annualRevenue: 28000000,
        employeeCount: 650,
        tier: 'gold',
        status: 'active_client',
        owner: manager._id
      },
      {
        name: 'BlueStar Healthcare Systems',
        industry: 'Healthcare & Life Sciences',
        website: 'https://bluestarhealth.example.com',
        phone: '+1 (800) 555-0199',
        address: { street: '77 Medical Center Dr', city: 'Boston', state: 'MA', postalCode: '02115', country: 'USA' },
        annualRevenue: 85000000,
        employeeCount: 2400,
        tier: 'platinum',
        status: 'prospect',
        owner: salesRep._id
      },
      {
        name: 'Zenith Media & Telecom',
        industry: 'Telecommunications & Media',
        website: 'https://zenithmedia.example.com',
        phone: '+1 (800) 555-0211',
        address: { street: '12 Sunset Blvd', city: 'Los Angeles', state: 'CA', postalCode: '90028', country: 'USA' },
        annualRevenue: 18000000,
        employeeCount: 420,
        tier: 'silver',
        status: 'active_client',
        owner: salesRep._id
      }
    ]);

    logger.info('Seeding client contacts...');
    const contacts = await Contact.create([
      {
        firstName: 'Eleanor',
        lastName: 'Pena',
        email: 'eleanor.pena@horizonfinancial.example.com',
        phone: '+1 (555) 901-2244',
        company: companies[0]._id,
        jobTitle: 'Chief Technology Officer',
        department: 'Information Technology',
        owner: salesRep._id,
        isPrimary: true
      },
      {
        firstName: 'Devon',
        lastName: 'Lane',
        email: 'devon.lane@apextech.example.com',
        phone: '+1 (555) 902-7711',
        company: companies[1]._id,
        jobTitle: 'VP of Engineering',
        department: 'Engineering',
        owner: manager._id,
        isPrimary: true
      },
      {
        firstName: 'Courtney',
        lastName: 'Henry',
        email: 'courtney.h@bluestarhealth.example.com',
        phone: '+1 (555) 903-8822',
        company: companies[2]._id,
        jobTitle: 'Director of Procurement',
        department: 'Corporate Procurement',
        owner: salesRep._id,
        isPrimary: true
      }
    ]);

    logger.info('Seeding inbound CRM leads...');
    await Lead.create([
      {
        firstName: 'Murtuza',
        lastName: 'Kapadia',
        email: 'murtuza@globaltransit.example.com',
        phone: '+1 (555) 441-2091',
        companyName: 'Global Cloud Systems',
        title: 'IT Director',
        status: 'new',
        source: 'website',
        leadScore: 85,
        estimatedValue: 24000,
        owner: salesRep._id,
        notes: 'Inquiring for 250 enterprise seats with automated workflow migration.'
      },
      {
        firstName: 'Danielle',
        lastName: 'Russell',
        email: 'drussell@biomedlabs.example.com',
        phone: '+1 (555) 441-8933',
        companyName: 'BioMed Laboratory Sciences',
        title: 'Head of Commercial Operations',
        status: 'contacted',
        source: 'referral',
        leadScore: 92,
        estimatedValue: 48000,
        owner: salesRep._id,
        notes: 'Needs HIPAA compliant CRM deployment and secure audit logs.'
      },
      {
        firstName: 'Tarmen',
        lastName: 'Steele',
        email: 'tsteele@urbanrealty.example.com',
        phone: '+1 (555) 442-1100',
        companyName: 'Urban Capital Partners',
        title: 'Managing Partner',
        status: 'qualified',
        source: 'advertisement',
        leadScore: 78,
        estimatedValue: 18000,
        owner: manager._id,
        notes: 'Multi-office deal pipeline tracking and customized reporting.'
      },
      {
        firstName: 'Myla',
        lastName: 'Zhao',
        email: 'mzhao@nexusevents.example.com',
        phone: '+1 (555) 442-5521',
        companyName: 'Nexus Global Logistics',
        title: 'VP of Commercial Strategy',
        status: 'new',
        source: 'website',
        leadScore: 65,
        estimatedValue: 14500,
        owner: salesRep._id,
        notes: 'Enterprise contract pipeline and quotation workflow.'
      },
      {
        firstName: 'Vinod',
        lastName: 'Sharma',
        email: 'vinod.sharma@indiapack.example.com',
        phone: '+1 (555) 443-8899',
        companyName: 'Apex Enterprise Solutions',
        title: 'General Manager',
        status: 'converted',
        source: 'referral',
        leadScore: 95,
        estimatedValue: 56000,
        owner: salesRep._id,
        isConverted: true,
        convertedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    logger.info('Seeding sales pipeline opportunities...');
    const opportunities = await Opportunity.create([
      {
        title: 'Horizon Financial - Core Cloud Modernization',
        company: companies[0]._id,
        contact: contacts[0]._id,
        amount: 64000,
        stage: 'negotiation',
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: 'high',
        owner: salesRep._id
      },
      {
        title: 'Apex Global - 500-User Enterprise Tier',
        company: companies[1]._id,
        contact: contacts[1]._id,
        amount: 48000,
        stage: 'proposal',
        probability: 60,
        expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        priority: 'critical',
        owner: manager._id
      },
      {
        title: 'BlueStar Health - Multi-Facility HIPAA Deployment',
        company: companies[2]._id,
        contact: contacts[2]._id,
        amount: 112000,
        stage: 'qualification',
        probability: 40,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        priority: 'critical',
        owner: salesRep._id
      },
      {
        title: 'Zenith Media - API Gateway & Workflow Automation',
        company: companies[3]._id,
        amount: 22000,
        stage: 'discovery',
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        owner: salesRep._id
      },
      {
        title: 'Metro Financial - Q4 Enterprise CRM Expansion',
        company: companies[0]._id,
        contact: contacts[0]._id,
        amount: 76000,
        stage: 'closed_won',
        probability: 100,
        wonDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        priority: 'high',
        owner: salesRep._id
      }
    ]);

    logger.info('Seeding Quotations with server calculations...');
    await Quotation.create({
      quoteNumber: 'QUO-2026-01001',
      opportunity: opportunities[0]._id,
      company: companies[0]._id,
      contact: contacts[0]._id,
      status: 'sent',
      items: [
        {
          product: products[0]._id,
          description: 'Enterprise Cloud License (Annual Tier) - 10 Seats',
          quantity: 10,
          unitPrice: 4800,
          discountPercent: 10,
          lineTotal: 43200
        },
        {
          product: products[1]._id,
          description: 'Dedicated Solutions Architect & Onboarding',
          quantity: 2,
          unitPrice: 3500,
          discountPercent: 0,
          lineTotal: 7000
        }
      ],
      subtotal: 55000,
      discountAmount: 4800,
      taxRatePercent: 5,
      taxAmount: 2510,
      totalAmount: 52710,
      createdBy: salesRep._id
    });

    logger.info('Seeding Tasks...');
    const now = new Date();
    await Task.create([
      {
        title: 'Review SOC-2 compliance addendum for Horizon Financial',
        dueDate: now,
        priority: 'urgent',
        status: 'pending',
        assignedTo: salesRep._id,
        relatedType: 'Opportunity',
        relatedId: opportunities[0]._id
      },
      {
        title: 'Follow up with Danielle regarding HIPAA security review',
        dueDate: now,
        priority: 'high',
        status: 'pending',
        assignedTo: salesRep._id,
        relatedType: 'Lead'
      },
      {
        title: 'Prepare final commercial proposal for Apex Global',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'pending',
        assignedTo: salesRep._id,
        relatedType: 'Opportunity',
        relatedId: opportunities[1]._id
      },
      {
        title: 'Complete quarterly pipeline forecast review',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'completed',
        assignedTo: manager._id,
        completedAt: new Date()
      }
    ]);

    logger.info('Seeding Support tickets...');
    await SupportTicket.create({
      ticketNumber: 'TCK-01001',
      subject: 'Okta SAML 2.0 Single Sign-On configuration inquiry',
      description: 'Client security team needs metadata XML and entity ID for production SSO setup.',
      company: companies[0]._id,
      contact: contacts[0]._id,
      priority: 'high',
      status: 'open',
      category: 'technical',
      assignedTo: supportAgent._id,
      comments: [
        {
          author: supportAgent._id,
          body: 'SAML metadata documentation sent to client security officer. Awaiting connection verification.',
          isInternal: true,
          createdAt: new Date()
        }
      ]
    });

    logger.info('Seeding in-app Notifications...');
    await Notification.create([
      {
        recipient: superAdmin._id,
        title: 'Deal Shifted to Negotiation',
        message: 'Horizon Financial deal moved to Negotiation stage ($64,000).',
        type: 'stage_change',
        link: '/opportunities'
      },
      {
        recipient: superAdmin._id,
        title: 'High-Score Enterprise Lead',
        message: 'Danielle Russell from BioMed Laboratory Sciences scored 92.',
        type: 'lead_assigned',
        link: '/leads'
      }
    ]);

    logger.info('Seeding Delivery Operations Merchants (matching platform roster)...');
    const merchantPassHash = await bcrypt.hash('EnterpriseCRM2026!', 10);
    await Merchant.create([
      {
        merchantName: 'Bazaa Furniture',
        merchantCode: 'MER-BAZA-001',
        status: 'Active',
        loginEmail: 'Delivery@bazaa.com.au',
        passwordHash: merchantPassHash, // EnterpriseCRM2026!
        linkToTeam: 'All Teams',
        storeDetails: {
          contactName: 'Henry',
          phone: '0468866289',
          contactEmail: 'Delivery@bazaa.com.au',
          address: '42 Commercial Road, Prahran VIC 3181'
        }
      },
      {
        merchantName: 'Berkowitz Furniture',
        merchantCode: 'MER-BERK-002',
        status: 'Active',
        loginEmail: 'Delivery@berkowitz.com',
        passwordHash: merchantPassHash,
        linkToTeam: 'All Teams',
        storeDetails: {
          contactName: 'Merri',
          phone: '+61 412 860 357',
          contactEmail: 'Delivery@berkowitz.com',
          address: '79 Rushdale Street, Knoxfield VIC 3180'
        }
      },
      {
        merchantName: 'craft media hub',
        merchantCode: 'MER-CRAF-003',
        status: 'Active',
        loginEmail: 'seo.craftmediahub@gmail.com',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'Raj',
          phone: '8767876524',
          contactEmail: 'seo.craftmediahub@gmail.com',
          address: '8 Cactus Lane, Campbellfield VIC 3061'
        }
      },
      {
        merchantName: 'Delivery Plus',
        merchantCode: 'MER-DELP-004',
        status: 'Active',
        loginEmail: 'info@deliveryplus.com.au',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'Arjun',
          phone: '0410002782',
          contactEmail: 'info@deliveryplus.com.au',
          address: '8 Cactus Lane, Campbellfield VIC 3061'
        }
      },
      {
        merchantName: 'Fenton&Fenton',
        merchantCode: 'MER-FENT-005',
        status: 'Active',
        loginEmail: 'johnfelise@fentonandfenton.com.au',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'John felise',
          phone: '0447432079',
          contactEmail: 'johnfelise@fentonandfenton.com.au',
          address: '6-8 Eskay Road, Oakleigh South VIC 3167'
        }
      },
      {
        merchantName: 'Fenton&Fenton ( Test Account )',
        merchantCode: 'MER-FENT-006',
        status: 'Active',
        loginEmail: 'Fenton@fenton.com',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'John felise',
          phone: '+61 447 432 079',
          contactEmail: 'Fenton@fenton.com',
          address: '8 Cactus Lane, Campbellfield VIC 3061'
        }
      },
      {
        merchantName: 'Satara',
        merchantCode: 'MER-SATA-007',
        status: 'Active',
        loginEmail: 'jorden@satara.com.au',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'Jordan',
          phone: '(03) 9587 4469',
          contactEmail: 'jorden@satara.com.au',
          address: '13 Cochranes Road, Moorabbin VIC 3189'
        }
      },
      {
        merchantName: 'Sofa & Soul',
        merchantCode: 'MER-SOFA-008',
        status: 'Active',
        loginEmail: 'delivery@sofasoul.com.au',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'Anna',
          phone: '0394278555',
          contactEmail: 'delivery@sofasoul.com.au',
          address: '614 Church St, Richmond VIC 3121'
        }
      },
      {
        merchantName: 'Sofas Direct',
        merchantCode: 'MER-SOFD-009',
        status: 'Active',
        loginEmail: 'Delivery@sofasdirect.com',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'Jen',
          phone: '0483300321',
          contactEmail: 'Delivery@sofasdirect.com',
          address: '283 Burwood Road, Hawthorn VIC 3122'
        }
      },
      {
        merchantName: 'Urban Rhythm',
        merchantCode: 'MER-URBN-010',
        status: 'Active',
        loginEmail: 'Delivery@urbanrhythm.com',
        passwordHash: merchantPassHash,
        linkToTeam: 'Merchants',
        storeDetails: {
          contactName: 'Jen',
          phone: '0483300321',
          contactEmail: 'Delivery@urbanrhythm.com',
          address: '544 Church St, Richmond VIC 3121'
        }
      }
    ]);

    logger.info('✅ Database successfully populated with realistic Enterprise CRM records!');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
