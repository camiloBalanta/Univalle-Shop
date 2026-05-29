/**
 * PUERTO: Interfaz de Servicio Externo
 *
 * Define el contrato para comunicarse con otros microservicios.
 * Permite obtener datos de órdenes, catálogo y usuarios.
 */

export interface IOrder {
  productId?: string;
  product: string;
  category: string;
  date: Date;
  status?: string;
}

export interface ICatalogProduct {
  productId: string;
  product: string;
  category: string;
}

export interface IPopularProduct {
  productId?: string;
  product: string;
  popularity: number;
}

export interface ISimilarUser {
  userId: string;
  purchases: string[];
}

export interface IExternalServicePort {
  /**
   * Obtiene el historial de órdenes de un usuario
   */
  getUserOrders(userId: string): Promise<IOrder[]>;

  /**
   * Obtiene el catálogo completo de productos
   */
  getCatalog(): Promise<ICatalogProduct[]>;

  /**
   * Obtiene productos populares con su puntuación
   */
  getPopularProducts(): Promise<IPopularProduct[]>;

  /**
   * Obtiene usuarios con preferencias similares
   */
  getSimilarUsers(userId: string): Promise<ISimilarUser[]>;
}
