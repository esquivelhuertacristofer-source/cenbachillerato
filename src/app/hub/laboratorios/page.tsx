import { permanentRedirect } from "next/navigation";

/*
 * Cada laboratorio vive en /hub/laboratorios/<slug>, pero el índice está en
 * /hub/recursos/laboratorios. Quien borra el slug de la barra de direcciones
 * (o llega por un enlace viejo) se topaba con un 404; aquí lo llevamos al índice.
 */
export default function LaboratoriosIndice() {
  permanentRedirect("/hub/recursos/laboratorios");
}
