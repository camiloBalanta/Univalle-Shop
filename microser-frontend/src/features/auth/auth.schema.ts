import { z } from 'zod';

export const loginSchema = z.object({
  codigo: z.string().min(2, 'Ingresa un codigo valido').regex(/^[123]\d+$/, 'Debe iniciar por 1, 2 o 3'),
  password: z.string().min(1, 'Ingresa tu contrasena'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
