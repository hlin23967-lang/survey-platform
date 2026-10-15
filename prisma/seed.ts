import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.survey.findFirst({
    where: { slug: "employee-satisfaction-demo" },
  });
  if (existing) {
    console.log("Demo survey already exists:", existing.slug);
    return;
  }

  const survey = await prisma.survey.create({
    data: {
      title: "员工满意度调研",
      description:
        "这是一份演示问卷，大约需要 1 分钟。感谢你的参与！\n（面试演示用示例数据）",
      slug: "employee-satisfaction-demo",
      status: "published",
      questions: {
        create: [
          {
            type: "rating",
            title: "整体而言，你对当前工作的满意度？",
            required: true,
            options: "[]",
            order: 0,
          },
          {
            type: "single",
            title: "你更希望哪方面得到改善？",
            required: true,
            options: JSON.stringify([
              "薪酬福利",
              "工作负荷",
              "成长机会",
              "团队协作",
              "办公环境",
            ]),
            order: 1,
          },
          {
            type: "multiple",
            title: "过去一个月，哪些因素影响了你的状态？（可多选）",
            required: false,
            options: JSON.stringify([
              "项目节奏紧",
              "跨部门沟通",
              "工具效率",
              "个人生活安排",
              "其他",
            ]),
            order: 2,
          },
          {
            type: "text",
            title: "还有什么想补充的吗？",
            required: false,
            options: "[]",
            order: 3,
          },
        ],
      },
    },
  });

  console.log("Seeded demo survey:", survey.slug);
  console.log("Public URL path: /s/employee-satisfaction-demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
