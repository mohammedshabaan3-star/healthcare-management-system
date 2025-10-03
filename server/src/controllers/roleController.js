// server/src/controllers/roleController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ جلب كل الأدوار
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'فشل في جلب الأدوار' });
  }
};

// ✅ إضافة دور جديد
export const createRole = async (req, res) => {
  const { name, displayName, description, permissions } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'اسم الدور (بالإنجليزية) مطلوب' });
  }
  if (!displayName) {
    return res.status(400).json({ error: 'الاسم المعروض (بالعربية) مطلوب' });
  }

  try {
    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: 'هذا الدور موجود بالفعل' });
    }

    // ✅ تأكد من أن permissions كائن صالح، أو اجعله كائنًا فارغًا
    const parsedPermissions = typeof permissions === 'object' ? permissions : {};

    const newRole = await prisma.role.create({
      data: {
        name,
        displayName,
        description: description || '',
        permissions: parsedPermissions // Prisma يقبل كائنًا مباشرًا لأن الحقل من نوع Json
      }
    });

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'فشل في إضافة الدور' });
  }
};

// ✅ تعديل دور
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, displayName, description, permissions } = req.body;

  try {
  const role = await prisma.role.findUnique({ where: { id: parseInt(id, 10) } });
    if (!role) {
      return res.status(404).json({ error: 'الدور غير موجود' });
    }

    // ✅ تأكد من أن permissions كائن صالح
    const parsedPermissions = typeof permissions === 'object' ? permissions : role.permissions;

    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: name || role.name,
        displayName: displayName || role.displayName,
        description: description !== undefined ? description : role.description,
        permissions: parsedPermissions
      }
    });

    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'فشل في تعديل الدور' });
  }
};

// ✅ حذف دور
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
  const role = await prisma.role.findUnique({ where: { id: parseInt(id, 10) } });
    if (!role) {
      return res.status(404).json({ error: 'الدور غير موجود' });
    }

  await prisma.role.delete({ where: { id: parseInt(id, 10) } });

    res.json({ success: true, message: 'تم حذف الدور بنجاح' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'فشل في حذف الدور' });
  }
};