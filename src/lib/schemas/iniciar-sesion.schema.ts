import { z } from 'zod';

export const IniciarSesionSchema = z.object({
  email: z.string().trim().min(1, 'El correo es obligatorio').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  consentimiento: z.literal(
    true,
    'Debes aceptar el Aviso de Privacidad y los Términos de Uso para continuar.'
  ),
});

export type IniciarSesionInput = z.infer<typeof IniciarSesionSchema>;
