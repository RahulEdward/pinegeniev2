import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { prisma } from "./prisma";

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
};
