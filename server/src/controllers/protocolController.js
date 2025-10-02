import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 📌 جلب جميع البروتوكولات
 */
export const getProtocols = async (req, res) => {
  try {
    const protocols = await prisma.protocol.findMany({
      orderBy: { name: "asc" },
    });
    res.json(protocols);
  } catch (error) {
    console.error("❌ خطأ في جلب البروتوكولات:", error);
    res.status(500).json({ error: "فشل في جلب البروتوكولات" });
  }
};

/**
 * 📌 إنشاء بروتوكول جديد
 */
export const createProtocol = async (req, res) => {
  const { name, code, description } = req.body;

  if (!name || !code) {
    return res.status(400).json({ error: "الاسم والكود مطلوبان" });
  }

  try {
    // تحقق من وجود الكود مسبقاً
    const existingProtocol = await prisma.protocol.findUnique({
      where: { code },
    });
    if (existingProtocol) {
      return res.status(400).json({ error: "كود البروتوكول موجود مسبقاً" });
    }

    const protocol = await prisma.protocol.create({
      data: {
        name,
        code,
        description,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "✅ تم إضافة البروتوكول بنجاح",
      protocol,
    });
  } catch (error) {
    console.error("❌ خطأ في إنشاء البروتوكول:", error);
    res.status(500).json({ error: "فشل في إضافة البروتوكول" });
  }
};

/**
 * 📌 تحديث بروتوكول
 */
export const updateProtocol = async (req, res) => {
  const { id } = req.params;
  const { name, code, description, isActive } = req.body;

  try {
    if (code) {
      const existingProtocol = await prisma.protocol.findFirst({
        where: { code, NOT: { id: parseInt(id) } },
      });
      if (existingProtocol) {
        return res.status(400).json({ error: "كود البروتوكول موجود مسبقاً" });
      }
    }

    const protocol = await prisma.protocol.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        description,
        isActive,
      },
    });

    res.json({
      success: true,
      message: "✅ تم تحديث البروتوكول بنجاح",
      protocol,
    });
  } catch (error) {
    console.error("❌ خطأ في تحديث البروتوكول:", error);
    res.status(500).json({ error: "فشل في تحديث البروتوكول" });
  }
};

/**
 * 📌 حذف بروتوكول
 */
export const deleteProtocol = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.protocol.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "🗑️ تم حذف البروتوكول بنجاح",
    });
  } catch (error) {
    console.error("❌ خطأ في حذف البروتوكول:", error);
    res.status(500).json({ error: "فشل في حذف البروتوكول" });
  }
};

/**
 * 📌 تفعيل/إلغاء تفعيل بروتوكول
 */
export const toggleProtocolStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const protocol = await prisma.protocol.findUnique({
      where: { id: parseInt(id) },
    });
    if (!protocol) {
      return res.status(404).json({ error: "البروتوكول غير موجود" });
    }

    const updatedProtocol = await prisma.protocol.update({
      where: { id: parseInt(id) },
      data: { isActive: !protocol.isActive },
    });

    res.json({
      success: true,
      message: `تم ${updatedProtocol.isActive ? "✅ تفعيل" : "❌ إلغاء تفعيل"} البروتوكول`,
      protocol: updatedProtocol,
    });
  } catch (error) {
    console.error("❌ خطأ في تغيير حالة البروتوكول:", error);
    res.status(500).json({ error: "فشل في تغيير حالة البروتوكول" });
  }
};
