/**
 * CONSTANTES: Validación
 *
 * Constantes reutilizables para validar datos en toda la aplicación.
 */

export const VALIDATION_MESSAGES = {
  USER_ID_REQUIRED: 'El userId es requerido y debe ser una cadena no vacía',
  RECOMMENDATIONS_NOT_FOUND:
    'No se encontraron recomendaciones para este usuario',
  RECOMMENDATIONS_NOT_FOUND_TO_UPDATE:
    'No se encontraron recomendaciones para actualizar',
  RECOMMENDATIONS_NOT_FOUND_TO_DELETE:
    'No se encontraron recomendaciones para eliminar',
  INVALID_RECOMMENDATION_DATA: 'Datos de recomendación inválidos',
};

export const VALIDATION_PATTERNS = {
  USER_ID: /^[a-zA-Z0-9_-]+$/,
};
