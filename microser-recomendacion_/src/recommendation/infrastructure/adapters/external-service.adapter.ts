/**
 * ADAPTADOR: External Service Port Implementation
 *
 * Implementa la interfaz IExternalServicePort.
 * Proporciona datos de otros microservicios o fuentes externas.
 * Actualmente usa datos simulados, pero puede integrarse con APIs reales.
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  IExternalServicePort,
  IOrder,
  ICatalogProduct,
  IPopularProduct,
  ISimilarUser,
} from '../../domain/ports/external-service.port';

@Injectable()
export class ExternalServiceAdapter implements IExternalServicePort {
  private readonly logger = new Logger(ExternalServiceAdapter.name);

  /**
   * Obtiene órdenes de un usuario desde el Servicio de Órdenes
   * TODO: Integrar con Orders Microservice (puerto 3001)
   */
  async getUserOrders(userId: string): Promise<IOrder[]> {
    this.logger.debug(
      `[Adaptador Externo] Obteniendo órdenes para usuario: ${userId}`,
    );

    // Datos simulados - Reemplazar con llamada a Orders Service
    return [
      { product: 'Laptop', category: 'tech', date: new Date() },
      { product: 'Mouse', category: 'tech', date: new Date() },
    ];
  }

  /**
   * Obtiene catálogo de productos desde el Servicio de Catálogo
   * TODO: Integrar con Catalog Microservice (puerto 3002)
   */
  async getCatalog(): Promise<ICatalogProduct[]> {
    this.logger.debug(`[Adaptador Externo] Obteniendo catálogo de productos`);

    // Datos simulados - Reemplazar con llamada a Catalog Service
    return [
      { product: 'Laptop', category: 'tech' },
      { product: 'Mouse', category: 'tech' },
      { product: 'Teclado', category: 'tech' },
      { product: 'Monitor', category: 'tech' },
      { product: 'Audifonos', category: 'tech' },
      { product: 'Silla', category: 'home' },
      { product: 'Escritorio', category: 'home' },
      { product: 'Lampara', category: 'home' },
    ];
  }

  /**
   * Obtiene productos populares desde Analytics Service
   * TODO: Integrar con Analytics/Orders Microservice
   */
  async getPopularProducts(): Promise<IPopularProduct[]> {
    this.logger.debug(`[Adaptador Externo] Obteniendo productos populares`);

    // Datos simulados - Reemplazar con análisis real de ventas
    return [
      { product: 'Monitor', popularity: 0.9 },
      { product: 'Teclado', popularity: 0.85 },
      { product: 'Audifonos', popularity: 0.8 },
      { product: 'Silla', popularity: 0.6 },
      { product: 'Escritorio', popularity: 0.55 },
    ];
  }

  /**
   * Obtiene usuarios similares mediante análisis colaborativo
   * TODO: Integrar con Machine Learning Service o análisis de usuarios
   */
  async getSimilarUsers(userId: string): Promise<ISimilarUser[]> {
    this.logger.debug(
      `[Adaptador Externo] Obteniendo usuarios similares a: ${userId}`,
    );

    // Datos simulados - Reemplazar con análisis colaborativo real
    return [
      { userId: '999', purchases: ['Monitor', 'Audifonos'] },
      { userId: '888', purchases: ['Teclado', 'Silla'] },
    ];
  }

  /**
   * Método auxiliar para realizar llamadas HTTP a otros servicios
   * Se puede usar cuando se integren APIs reales
   */
  private async callExternalService(
    url: string,
    method: string = 'GET',
  ): Promise<any> {
    try {
      this.logger.debug(`[Adaptador Externo] Llamando a: ${url}`);
      // Implementar cuando se integren servicios reales
      // const response = await fetch(url, { method });
      // return response.json();
    } catch (error) {
      this.logger.error(
        `[Adaptador Externo] Error llamando a ${url}:`,
        error.message,
      );
      throw error;
    }
  }
}
