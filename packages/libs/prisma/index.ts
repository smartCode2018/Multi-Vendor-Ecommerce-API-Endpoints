// import { PrismaClient } from "@prisma/client";

// declare global {
//   namespace globalThis {
//     var prismadb: PrismaClient;
//   }
// }

// const prisma = new PrismaClient();

// if (process.env.NODE_ENV === "production") global.prismadb = prisma;

// export default prisma;

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>;
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal || prismaClientSingleton();

export default prisma;
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
