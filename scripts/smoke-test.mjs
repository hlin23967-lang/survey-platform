import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const survey = await prisma.survey.findFirst({
  include: { questions: true },
});
console.log("title:", survey?.title);
console.log("q0:", survey?.questions[0]?.title);

const loginRes = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "admin123" }),
});
const setCookie = loginRes.headers.getSetCookie?.() || [];
const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
console.log("login:", loginRes.status, await loginRes.json());

const pub = await fetch(
  "http://localhost:3000/api/s/employee-satisfaction-demo"
).then((r) => r.json());
console.log("api title:", pub.title);

const answers = {};
for (const q of pub.questions) {
  if (q.type === "rating") answers[q.id] = 4;
  else if (q.type === "single") answers[q.id] = q.options[0];
  else if (q.type === "multiple") answers[q.id] = [q.options[0]];
  else answers[q.id] = "demo note";
}

const submit = await fetch(
  "http://localhost:3000/api/s/employee-satisfaction-demo",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  }
);
console.log("submit:", submit.status, await submit.json());

const list = await fetch(
  `http://localhost:3000/api/admin/surveys/${pub.id}/responses`,
  { headers: { Cookie: cookie } }
).then((r) => r.json());
console.log("responses:", list.responses?.length);

await prisma.$disconnect();
