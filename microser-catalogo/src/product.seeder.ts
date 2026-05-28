import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './infrastructure/product.schema';

@Injectable()
export class ProductSeeder {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async seed() {
    const existingCount = await this.productModel.countDocuments();
    
    if (existingCount > 0) {
      console.log('✓ La colección de productos ya contiene datos. Skipping seed.');
      return;
    }

    const sampleProducts = [
      {
        name: 'Laptop Dell XPS 13',
        description: 'Ultrabook portátil con pantalla FHD, procesador Intel i7, 16GB RAM',
        price: 1299.99,
        stock: 25,
        sku: 'DELL-XPS-13-2024',
        category: 'Laptops',
        tags: ['laptop', 'dell', 'ultrabook', 'portable'],
        rating: 4.8,
        reviewCount: 156,
        images: [
          'https://via.placeholder.com/300x300?text=Dell+XPS+13',
        ],
        active: true,
        supplier: 'Dell Inc.',
      },
      {
        name: 'Mouse Logitech MX Master 3S',
        description: 'Mouse inalámbrico profesional con customización',
        price: 99.99,
        stock: 150,
        sku: 'LOGITECH-MX-MASTER-3S',
        category: 'Accesorios',
        tags: ['mouse', 'logitech', 'wireless', 'professional'],
        rating: 4.9,
        reviewCount: 892,
        images: [
          'https://via.placeholder.com/300x300?text=Logitech+MX+Master',
        ],
        active: true,
        supplier: 'Logitech',
      },
      {
        name: 'Monitor LG 27" 4K UltraFine',
        description: 'Monitor profesional 4K con color accuracy 99% Adobe RGB',
        price: 599.99,
        stock: 10,
        sku: 'LG-27-4K-ULTRAFINE',
        category: 'Monitores',
        tags: ['monitor', '4k', 'professional', 'lg', 'color-accurate'],
        rating: 4.7,
        reviewCount: 245,
        images: [
          'https://via.placeholder.com/300x300?text=LG+27+4K',
        ],
        active: true,
        supplier: 'LG Electronics',
      },
    ];

    try {
      await this.productModel.insertMany(sampleProducts);
      console.log(
        `✓ Seed completado: ${sampleProducts.length} productos insertados`,
      );
    } catch (error) {
      console.error('✗ Error durante el seed:', error.message);
      throw error;
    }
  }
}
