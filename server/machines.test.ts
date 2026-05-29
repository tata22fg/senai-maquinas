import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock db module ───────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  getAllMachines: vi.fn().mockResolvedValue([
    {
      id: 1,
      code: "TOR-01",
      name: "Torno 01",
      type: "Torno Mecânico",
      location: "Bancada A",
      status: "available",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      code: "FRE-01",
      name: "Fresa 01",
      type: "Fresadora",
      location: "Bancada B",
      status: "faulty",
      notes: "Motor com ruído",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getMachineById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        code: "TOR-01",
        name: "Torno 01",
        type: "Torno Mecânico",
        location: "Bancada A",
        status: "available",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return undefined;
  }),
  getFaultyMachines: vi.fn().mockResolvedValue([
    {
      id: 2,
      code: "FRE-01",
      name: "Fresa 01",
      type: "Fresadora",
      location: "Bancada B",
      status: "faulty",
      notes: "Motor com ruído",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  createMachine: vi.fn().mockResolvedValue(undefined),
  updateMachine: vi.fn().mockResolvedValue(undefined),
  deleteMachine: vi.fn().mockResolvedValue(undefined),
  getUsageRecordsByMachine: vi.fn().mockResolvedValue([]),
  getAllUsageRecords: vi.fn().mockResolvedValue([]),
  getActiveUsageForMachine: vi.fn().mockResolvedValue(undefined),
  createUsageRecord: vi.fn().mockResolvedValue(undefined),
  endUsageRecord: vi.fn().mockResolvedValue(undefined),
  getFaultReportsByMachine: vi.fn().mockResolvedValue([]),
  getAllFaultReports: vi.fn().mockResolvedValue([]),
  getOpenFaultReports: vi.fn().mockResolvedValue([]),
  createFaultReport: vi.fn().mockResolvedValue(undefined),
  updateFaultReport: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 10,
      openId: "user-123",
      email: "docente@senai.br",
      name: "Carlos Silva",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-001",
      email: "manutencao@senai.br",
      name: "Equipe Manutenção",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("machines.list", () => {
  it("returns all machines for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.machines.list();
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe("TOR-01");
    expect(result[1].status).toBe("faulty");
  });
});

describe("machines.get", () => {
  it("returns a machine by id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.machines.get({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.name).toBe("Torno 01");
  });

  it("returns undefined for unknown id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.machines.get({ id: 999 });
    expect(result).toBeUndefined();
  });
});

describe("machines.getFaulty", () => {
  it("returns only faulty machines", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.machines.getFaulty();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("faulty");
  });
});

describe("machines.create", () => {
  it("allows admin to create a machine", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.machines.create({
      code: "RET-01",
      name: "Retífica 01",
      type: "Retificadora",
      location: "Bancada C",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.machines.create({
        code: "RET-02",
        name: "Retífica 02",
        type: "Retificadora",
        location: "Bancada C",
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.machines.create({
        code: "RET-03",
        name: "Retífica 03",
        type: "Retificadora",
        location: "Bancada C",
      })
    ).rejects.toThrow();
  });
});

describe("machines.delete", () => {
  it("allows admin to delete a machine", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.machines.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.machines.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("usage.start", () => {
  it("allows authenticated users to start usage", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.usage.start({
      machineId: 1,
      teacherName: "Carlos Silva",
      className: "Técnico em Mecânica - T01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.usage.start({
        machineId: 1,
        teacherName: "Carlos Silva",
        className: "T01",
      })
    ).rejects.toThrow();
  });
});

describe("faults.report", () => {
  it("allows authenticated users to report a fault", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.faults.report({
      machineId: 1,
      reportedBy: "Carlos Silva",
      description: "Ruído anormal no motor",
      markAsFaulty: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.faults.report({
        machineId: 1,
        reportedBy: "Anônimo",
        description: "Problema",
        markAsFaulty: false,
      })
    ).rejects.toThrow();
  });
});

describe("faults.updateStatus", () => {
  it("allows admin to update fault status", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.faults.updateStatus({
      id: 1,
      status: "resolved",
      machineId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.faults.updateStatus({ id: 1, status: "resolved" })
    ).rejects.toThrow();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
