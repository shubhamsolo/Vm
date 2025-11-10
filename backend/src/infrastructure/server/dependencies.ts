import { PrismaClient } from '@prisma/client';
import { Express } from 'express';

// --- 1. Import Adapters ---
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository';
import { RouteController } from '../../adapters/inbound/http/RouteController';
// --- Banking/Compliance Imports ---
import { PrismaComplianceRepository } from '../../adapters/outbound/postgres/PrismaComplianceRepository';
import { PrismaBankingRepository } from '../../adapters/outbound/postgres/PrismaBankingRepository';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/BankingController';

// --- 2. Import Use Cases ---
import { GetRoutes } from '../../core/application/GetRoutes';
import { SetBaseline } from '../../core/application/SetBaseline';
import { GetComparison } from '../../core/application/GetComparison';
// --- Banking/Compliance Imports ---
import { GetComplianceBalance } from '../../core/application/GetComplianceBalance';
import { GetBankedRecords } from '../../core/application/GetBankedRecords';
import { BankSurplus } from '../../core/application/BankSurplus';
import { ApplyBankedSurplus } from '../../core/application/ApplyBankedSurplus';
import { PrismaPoolingRepository } from '../../adapters/outbound/postgres/PrismaPoolingRepository';
import { GetAdjustedComplianceBalance } from '../../core/application/GetAdjustedComplianceBalance';
import { PoolingController } from '../../adapters/inbound/http/PoolingController';
import { CreatePool } from '../../core/application/CreatePool';

// --- 3. Create tool instances ---
const prisma = new PrismaClient();

export const wireUpDependencies = (app: Express) => {
  
  // --- Create all Repositories ---
  const routeRepo = new PrismaRouteRepository(prisma);
  const complianceRepo = new PrismaComplianceRepository(prisma);
  const bankingRepo = new PrismaBankingRepository(prisma);
  const poolingRepo = new PrismaPoolingRepository(prisma); // <-- ADD THIS

  // --- "Routes" Feature Slice ---
  const getRoutesUseCase = new GetRoutes(routeRepo);
  const setBaselineUseCase = new SetBaseline(routeRepo);
  const getComparisonUseCase = new GetComparison(routeRepo);
  
  const routeController = new RouteController(
    getRoutesUseCase, 
    setBaselineUseCase,
    getComparisonUseCase
  );
  app.use('/api/routes', routeController.router);
  
  // --- "Compliance" Feature Slice ---
  const getComplianceBalanceUseCase = new GetComplianceBalance(complianceRepo, routeRepo);
  const getAdjustedComplianceBalanceUseCase = new GetAdjustedComplianceBalance(complianceRepo);
  
  const complianceController = new ComplianceController(
    getComplianceBalanceUseCase,
    getAdjustedComplianceBalanceUseCase // <-- INJECT
  );
  app.use('/api/compliance', complianceController.router);

  // --- "Banking" Feature Slice ---
  const getBankedRecordsUseCase = new GetBankedRecords(bankingRepo);
  const bankSurplusUseCase = new BankSurplus(bankingRepo, complianceRepo);
  const applyBankedSurplusUseCase = new ApplyBankedSurplus(bankingRepo, complianceRepo);

  const bankingController = new BankingController(
    bankSurplusUseCase,
    applyBankedSurplusUseCase,
    getBankedRecordsUseCase
  );
  app.use('/api/banking', bankingController.router);

  // --- "Pooling" Feature Slice ---
  const createPoolUseCase = new CreatePool(poolingRepo, complianceRepo);
  
  const poolingController = new PoolingController(createPoolUseCase);
  app.use('/api/pools', poolingController.router);
};