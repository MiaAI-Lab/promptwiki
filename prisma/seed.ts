import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^file:/, '')
  : path.resolve(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

const prisma = new PrismaClient({ adapter });

async function main() {
  const prompts = [
    {
      title: 'Code Review',
      description: 'Comprehensive code review prompt for any language',
      content: `You are a senior software engineer reviewing this code.

Focus on:
- correctness
- security
- maintainability
- performance
- edge cases
- unnecessary complexity

Return:
1. Critical issues
2. Important improvements
3. Nice-to-have suggestions
4. A corrected version if needed

Code:
{{code}}`,
      category: 'Code Quality',
      model: 'GPT-4',
      favorite: true,
    },
    {
      title: 'Refactor Code',
      description: 'Prompt to refactor existing code for clarity and performance',
      content: `You are an expert software engineer specializing in clean code and refactoring.

Refactor the following code to improve:
- Readability and clarity
- Maintainability
- Performance where obvious
- Adherence to language idioms and best practices

Keep the same functionality. Do not add new features.

Provide:
1. The refactored code
2. A brief explanation of the key changes
3. Any trade-offs introduced

Code:
{{code}}

Language: {{language}}`,
      category: 'Code Quality',
      model: 'Claude',
      favorite: true,
    },
    {
      title: 'Debugging Assistant',
      description: 'Prompt to help debug code issues and errors',
      content: `You are an expert debugger. Help me diagnose and fix this issue.

Given:
- Language/Framework: {{language}}
- Error message: {{error}}
- Code:
{{code}}

Please:
1. Identify the root cause
2. Explain why it happens
3. Provide the fix with corrected code
4. Suggest how to prevent similar issues

Think step by step.`,
      category: 'Debugging',
      model: 'GPT-4',
      favorite: false,
    },
    {
      title: 'Dockerfile Review',
      description: 'Review and optimize Dockerfiles for security and best practices',
      content: `You are a DevOps engineer specializing in container security and Docker best practices.

Review this Dockerfile and provide:
1. Security issues (running as root, exposed secrets, etc.)
2. Size optimization suggestions (multi-stage builds, layer caching)
3. Best practice violations
4. An improved version of the Dockerfile

Dockerfile:
{{dockerfile}}`,
      category: 'DevOps',
      model: 'GPT-4',
      favorite: false,
    },
    {
      title: 'Test Generation',
      description: 'Generate unit tests for existing code',
      content: `You are a senior developer specializing in testing.

Generate comprehensive unit tests for the following code.

Requirements:
- Cover happy paths, edge cases, and error cases
- Use {{testingFramework}} as the testing framework
- Include descriptive test names
- Mock external dependencies where appropriate
- Follow the project's testing conventions

Code to test:
{{code}}

Language: {{language}}`,
      category: 'Testing',
      model: 'Claude',
      favorite: false,
    },
    {
      title: 'Architecture Review',
      description: 'Review system architecture and design decisions',
      content: `You are a principal software architect. Review the following system design.

Evaluate:
1. Scalability concerns
2. Potential bottlenecks
3. Security vulnerabilities
4. Maintainability and team collaboration impact
5. Technology choice appropriateness
6. Missing components or considerations

Provide actionable recommendations prioritized by impact.

Architecture description:
{{architecture}}

Context:
- Domain: {{domain}}
- Expected scale: {{scale}}
- Team size: {{teamSize}}`,
      category: 'Architecture',
      model: 'GPT-4',
      favorite: true,
    },
  ];

  for (const p of prompts) {
    const createdPrompt = await prisma.prompt.create({
      data: p,
    });

    console.log(`Created prompt: ${createdPrompt.title}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
