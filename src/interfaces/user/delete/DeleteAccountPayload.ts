/**
 * Lo que el API pide para borrar la cuenta.
 *
 * Los dos campos son opcionales aquí y excluyentes allí: el backend exige
 * `current_password` si la cuenta tiene contraseña, y `id_token` si se creó con
 * Google y no la tiene. Ver `DeleteAccountRequest` en el API.
 *
 * La web sólo manda el primero: su login de Google va por redirección y no le
 * queda ningún id_token que reenviar. El camino de `id_token` existe para las
 * apps de Android e iOS, que sí pueden pedirle uno nuevo al SDK.
 */
export interface DeleteAccountPayload {
    current_password?: string;
    id_token?: string;
}
