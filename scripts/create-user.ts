import { createUser } from "../src/features/auth/service";
import { userSchema } from "../src/schemas";
const [name, email, role, desk] = process.argv.slice(2);
const input = userSchema.parse({ name, email, role, desk, password: process.env.INITIAL_PASSWORD });
const user = createUser(input);
console.log(`Usuário criado: ${user.email} (${user.role}).`);
