import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { db } from "./db";
import { machines, faultReports, users } from "../drizzle/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { sendFaultReportEmail } from "./email";

export const appRouter = router({
  auth: router({
  me: publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, ctx.user.id));

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: ctx.user.id,
      name: ctx.user.name || "Usuário",
      email: ctx.user.email || "",
      role: "user",
    });

    return {
      id: ctx.user.id,
      name: ctx.user.name || "Usuário",
      email: ctx.user.email || "",
      role: "user",
    };
  }

  return existingUser[0];
}),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Logout logic would be handled by the session/cookie mechanism
      return { success: true };
    }),
    updateEmail: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(async ({ input, ctx }) => {

         console.log("EMAIL RECEBIDO:", input.email);
         console.log("USUÁRIO:", ctx.user);

    if (!ctx.user) {
      throw new Error("Usuário não autenticado");
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id));

    console.log("USUÁRIO NO BANCO:", existingUser);

    await db
      .update(users)
      .set({ email: input.email })
      .where(eq(users.id, ctx.user.id));

    console.log("EMAIL SALVO!");

    return {
      success: true,
      email: input.email,
    };
  }),
    getMe: publicProcedure.query(async ({ ctx }) => {
      console.log("=== GETME EXECUTOU ===");
      console.log("ctx.user:", ctx.user);
  if (!ctx.user) return null;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, ctx.user.id));

  if (existingUser.length === 0) {
    console.log("CRIANDO USUÁRIO NO BANCO");
    await db.insert(users).values({
      id: ctx.user.id,
      name: ctx.user.name || "Usuário",
      email: ctx.user.email || "",
      role: "user",
    });

    return {
      id: ctx.user.id,
      name: ctx.user.name || "Usuário",
      email: ctx.user.email || "",
      role: "user",
    };
  }

  return existingUser[0];
}),
  }),
  machines: router({
    list: publicProcedure.query(async () => {
      return await db.select().from(machines);
    }),
    getFaulty: publicProcedure.query(async () => {
      return await db.select().from(machines).where(eq(machines.status, "faulty"));
    }),
    get: publicProcedure.input(z.number()).query(async ({ input }) => {
      const result = await db.select().from(machines).where(eq(machines.id, input));
      return result[0];
    }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          code: z.string(),
          type: z.string(),
          location: z.string(),
          notes: z.string().optional(),
          status: z.enum(["available", "faulty"]).default("available"),
        })
      )
      .mutation(async ({ input }) => {
        return await db.insert(machines).values(input as any);
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string(),
          code: z.string(),
          type: z.string(),
          location: z.string(),
          notes: z.string().optional(),
          status: z.enum(["available", "faulty"]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.update(machines).set(data as any).where(eq(machines.id, id));
      }),
    delete: publicProcedure.input(z.number()).mutation(async ({ input }) => {
      return await db.delete(machines).where(eq(machines.id, input));
    }),
  }),
  faults: router({
    listAll: publicProcedure.input(z.object({ machineId: z.number().optional() })).query(async ({ input }) => {
      if (input.machineId) {
        return await db.select().from(faultReports).where(eq(faultReports.machineId, input.machineId)).orderBy(desc(faultReports.createdAt));
      }
      return await db.select().from(faultReports).orderBy(desc(faultReports.createdAt));
    }),
    listOpen: publicProcedure.query(async () => {
      return await db.select().from(faultReports).where(ne(faultReports.status, "resolved")).orderBy(desc(faultReports.createdAt));
    }),
    report: publicProcedure
      .input(
        z.object({
          machineId: z.number(),
          description: z.string(),
          reportedBy: z.string(),
          markAsFaulty: z.boolean().default(true),
        })
      )
      .mutation(async ({ input, ctx }) => {
        console.log("[Fault] === Novo reporte de defeito ===");
        console.log("[Fault] machineId:", input.machineId);
        console.log("[Fault] reportedBy:", input.reportedBy);
        console.log("[Fault] ctx.user:", ctx.user ? { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name } : "null");
        
        const { markAsFaulty, ...faultData } = input;
        const result = await db.insert(faultReports).values({
          ...faultData,
          status: "open",
        });
        
        if (markAsFaulty) {
          await db.update(machines).set({ status: "faulty" }).where(eq(machines.id, input.machineId));
        }
        
        // Enviar e-mail para o usuário conectado
        console.log("[Fault] Iniciando processo de envio de e-mail...");
        
        if (!ctx.user) {
          console.warn("[Fault] AVISO: Usuário não autenticado, não será enviado e-mail");
        } else {
          try {
            console.log("[Fault] Buscando usuário no banco com ID:", ctx.user.id);
            const currentUser = await db.select().from(users).where(eq(users.id, ctx.user.id));
            
            if (!currentUser || currentUser.length === 0) {
              console.warn("[Fault] AVISO: Usuário não encontrado no banco");
            } else {
              console.log("[Fault] Usuário encontrado:", { id: currentUser[0].id, email: currentUser[0].email, name: currentUser[0].name });
            }
            
            const userEmail = currentUser[0]?.email || ctx.user.email;
            console.log("[Fault] E-mail a ser usado:", userEmail);
            
            if (!userEmail) {
              console.warn("[Fault] AVISO: Nenhum e-mail disponível para envio");
            } else {
              console.log("[Fault] Buscando máquina com ID:", input.machineId);
              const machine = await db.select().from(machines).where(eq(machines.id, input.machineId));
              
              if (!machine || machine.length === 0) {
                console.warn("[Fault] AVISO: Máquina não encontrada");
              } else {
                console.log("[Fault] Máquina encontrada:", { id: machine[0].id, name: machine[0].name, code: machine[0].code });
                console.log("[Fault] Enviando e-mail para:", userEmail);
                
                await sendFaultReportEmail(
                  userEmail,
                  machine[0].name,
                  machine[0].code,
                  input.description,
                  input.reportedBy
                );
                
                console.log("[Fault] E-mail enviado com sucesso");
              }
            }
          } catch (error) {
            console.error("[Fault] ERRO ao enviar e-mail:", error);
            // Não falhar a operação se o e-mail não for enviado
          }
        }
        
        console.log("[Fault] === Fim do reporte ===");
        return result;
      }),
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        const result = await db.update(faultReports).set({ 
          status: input.status as any,
          resolvedAt: input.status === "resolved" ? Date.now() : null
        }).where(eq(faultReports.id, input.id));

        // If status is resolved, we should check if there are other open faults for this machine
        // If not, mark machine as available
        if (input.status === "resolved") {
          const fault = await db.select().from(faultReports).where(eq(faultReports.id, input.id));
          if (fault[0]) {
            const openFaults = await db.select()
              .from(faultReports)
              .where(and(eq(faultReports.machineId, fault[0].machineId), ne(faultReports.status, "resolved")));
            
            if (openFaults.length === 0) {
              await db.update(machines).set({ status: "available" }).where(eq(machines.id, fault[0].machineId));
            }
          }
        } else if (input.status === "open" || input.status === "in_progress") {
          const fault = await db.select().from(faultReports).where(eq(faultReports.id, input.id));
          if (fault[0]) {
            await db.update(machines).set({ status: "faulty" }).where(eq(machines.id, fault[0].machineId));
          }
        }

        return result;
      }),
    resolveLastForMachine: publicProcedure
      .input(z.object({ machineId: z.number() }))
      .mutation(async ({ input }) => {
        // Mark machine as available
        await db.update(machines).set({ status: "available" }).where(eq(machines.id, input.machineId));
        
        // Resolve all open faults for this machine
        await db.update(faultReports)
          .set({ 
            status: "resolved",
            resolvedAt: Date.now()
          })
          .where(and(eq(faultReports.machineId, input.machineId), ne(faultReports.status, "resolved")));
        
        return { success: true };
      }),
  }),
  analytics: router({
    summary: publicProcedure.query(async () => {
      const allFaults = await db.select().from(faultReports);
      const openFaults = allFaults.filter(f => f.status === "open");
      const inProgressFaults = allFaults.filter(f => f.status === "in_progress");
      const resolvedFaults = allFaults.filter(f => f.status === "resolved");
      
      // Calcular tempo médio de reparo
      const repairedWithTime = resolvedFaults.filter(f => f.resolvedAt && f.createdAt);
      const avgRepairTime = repairedWithTime.length > 0
        ? repairedWithTime.reduce((sum, f) => sum + ((f.resolvedAt || 0) - (f.createdAt?.getTime() || 0)), 0) / repairedWithTime.length / (1000 * 60 * 60) // em horas
        : 0;
      
      return {
        openCount: openFaults.length,
        inProgressCount: inProgressFaults.length,
        resolvedCount: resolvedFaults.length,
        totalCount: allFaults.length,
        avgRepairTimeHours: Math.round(avgRepairTime * 10) / 10,
      };
    }),
    
    faultsByType: publicProcedure.query(async () => {
      const allMachines = await db.select().from(machines);
      const allFaults = await db.select().from(faultReports);
      
      const typeMap: Record<string, number> = {};
      
      for (const fault of allFaults) {
        const machine = allMachines.find(m => m.id === fault.machineId);
        if (machine) {
          typeMap[machine.type] = (typeMap[machine.type] || 0) + 1;
        }
      }
      
      return Object.entries(typeMap).map(([type, count]) => ({
        type,
        count,
      })).sort((a, b) => b.count - a.count);
    }),
    
    topMachinesWithDefects: publicProcedure.query(async () => {
      const allMachines = await db.select().from(machines);
      const allFaults = await db.select().from(faultReports);
      
      const machineMap: Record<number, { name: string; code: string; count: number }> = {};
      
      for (const fault of allFaults) {
        const machine = allMachines.find(m => m.id === fault.machineId);
        if (machine) {
          if (!machineMap[machine.id]) {
            machineMap[machine.id] = { name: machine.name, code: machine.code, count: 0 };
          }
          machineMap[machine.id].count += 1;
        }
      }
      
      return Object.values(machineMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }),
    
    faultsTrend: publicProcedure.query(async () => {
      const allFaults = await db.select().from(faultReports);
      
      // Agrupar por mês
      const monthMap: Record<string, number> = {};
      
      for (const fault of allFaults) {
        const date = fault.createdAt instanceof Date ? fault.createdAt : new Date(fault.createdAt);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      }
      
      return Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({
          month,
          count,
        }));
    }),
    
    machineStats: publicProcedure.query(async () => {
      const allMachines = await db.select().from(machines);
      const allFaults = await db.select().from(faultReports);
      
      return allMachines.map(machine => {
        const machineFaults = allFaults.filter(f => f.machineId === machine.id);
        const openFaults = machineFaults.filter(f => f.status === "open");
        
        return {
          id: machine.id,
          name: machine.name,
          code: machine.code,
          type: machine.type,
          location: machine.location,
          status: machine.status,
          totalFaults: machineFaults.length,
          openFaults: openFaults.length,
        };
      }).sort((a, b) => b.totalFaults - a.totalFaults);
    }),
  }),
});

export type AppRouter = typeof appRouter;
