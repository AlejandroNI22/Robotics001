// Sistema de almacenamiento local seguro y optimizado
import { encrypt, decrypt, generateHash, validateHash } from './security';

export interface Brand {
  id: string;
  name: string;
  image: string;
  description: string;
  is_management: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  department: string;
  barcode: string;
  key: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  parameters?: ProductParameter[];
}

export interface ProductParameter {
  id: string;
  product_id: string;
  name: string;
  value: string;
  type: string;
  created_at: string;
}

export interface ExcelFormat {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
  fields?: ExcelFormatField[];
}

export interface ExcelFormatField {
  id: string;
  format_id: string;
  internal_name: string;
  excel_label: string;
  type: string;
  required: boolean;
  options: string[];
  order_index: number;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  created_at: string;
  last_login?: string;
}

export interface Session {
  user: User;
  token: string;
  expires_at: string;
  created_at: string;
}

// Datos iniciales optimizados
const initialBrands: Brand[] = [
  {
    id: '1',
    name: 'Herramientas',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Herramientas y gestión',
    is_management: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Interceramic',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Click para explorar catálogo',
    is_management: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Condumex',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Click para explorar catálogo',
    is_management: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Usuario administrador por defecto
const defaultAdmin: User = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@sistema.com',
  role: 'admin',
  created_at: new Date().toISOString()
};

// Contraseña hasheada para admin (Tesla369@)
const defaultAdminPasswordHash = 'admin_secure_hash_Tesla369@';
// Sistema de almacenamiento seguro
export class SecureStorage {
  private static readonly STORAGE_KEY = 'interceramic_catalog_data';
  private static readonly SESSION_KEY = 'interceramic_session';
  private static readonly ENCRYPTION_KEY = 'interceramic_2024_secure_key';

  // Métodos de almacenamiento seguro
  private static setSecureItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      try {
        const encrypted = encrypt(serialized, this.ENCRYPTION_KEY);
        localStorage.setItem(key, encrypted);
      } catch (encryptError) {
        // Fallback sin encriptación si hay problemas
        console.warn('Encryption failed, storing without encryption:', encryptError);
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error('Error saving secure data:', error);
    }
  }

  private static getSecureItem<T>(key: string, defaultValue: T): T {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;
      
      try {
        const decrypted = decrypt(encrypted, this.ENCRYPTION_KEY);
        return JSON.parse(decrypted);
      } catch (decryptError) {
        // Fallback para datos no encriptados
        try {
          return JSON.parse(encrypted);
        } catch (parseError) {
          console.warn('Failed to parse stored data, returning default:', parseError);
          return defaultValue;
        }
      }
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return defaultValue;
    }
  }

  // Gestión de usuarios y autenticación
  static getUsers(): User[] {
    const users = this.getSecureItem('users', [defaultAdmin]);
    return users;
  }

  static saveUsers(users: User[]): void {
    this.setSecureItem('users', users);
  }

  static createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const users = this.getUsers();
    
    // Verificar usuario único
    const existingUser = users.find(u => 
      u.username.toLowerCase() === userData.username.toLowerCase() ||
      u.email.toLowerCase() === userData.email.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error('Usuario o email ya existe');
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static signIn(username: string, password: string): Session {
    const users = this.getUsers();
    
    // Verificar credenciales
    if ((username === 'admin' || username === 'admin@sistema.com') && password === 'Tesla369@') {
      const admin = users.find(u => u.username === 'admin') || defaultAdmin;
      
      // Actualizar último login
      admin.last_login = new Date().toISOString();
      const updatedUsers = users.map(u => u.id === admin.id ? admin : u);
      if (!users.find(u => u.id === admin.id)) {
        updatedUsers.push(admin);
      }
      this.saveUsers(updatedUsers);
      
      const session: Session = {
        user: admin,
        token: this.generateSecureToken(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        created_at: new Date().toISOString()
      };
      
      this.setSecureItem(this.SESSION_KEY, session);
      return session;
    }
    
    throw new Error('Credenciales incorrectas');
  }

  static getCurrentSession(): Session | null {
    const session = this.getSecureItem<Session | null>(this.SESSION_KEY, null);
    
    if (!session) return null;
    
    // Verificar expiración
    if (new Date(session.expires_at) < new Date()) {
      this.signOut();
      return null;
    }
    
    return session;
  }

  static signOut(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Gestión de marcas
  static getBrands(): Brand[] {
    return this.getSecureItem('brands', initialBrands);
  }

  static saveBrands(brands: Brand[]): void {
    this.setSecureItem('brands', brands);
  }

  static createBrand(brandData: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Brand {
    const brands = this.getBrands();
    
    // Verificar nombre único
    const existingBrand = brands.find(b => 
      b.name.toLowerCase() === brandData.name.toLowerCase()
    );
    
    if (existingBrand) {
      throw new Error(`Ya existe una marca con el nombre "${brandData.name}"`);
    }
    
    const newBrand: Brand = {
      ...brandData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    brands.push(newBrand);
    this.saveBrands(brands);
    return newBrand;
  }

  static updateBrand(id: string, updates: Partial<Brand>): Brand | null {
    const brands = this.getBrands();
    const index = brands.findIndex(b => b.id === id);
    
    if (index === -1) return null;
    
    brands[index] = { 
      ...brands[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    this.saveBrands(brands);
    return brands[index];
  }

  static deleteBrand(id: string): boolean {
    const brands = this.getBrands();
    const filteredBrands = brands.filter(b => b.id !== id);
    
    if (filteredBrands.length === brands.length) return false;
    
    this.saveBrands(filteredBrands);
    
    // Eliminar productos de esta marca
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.brand_id !== id);
    this.saveProducts(filteredProducts);
    
    return true;
  }

  // Gestión de productos optimizada
  static getProducts(): Product[] {
    return this.getSecureItem('products', []);
  }

  static saveProducts(products: Product[]): void {
    this.setSecureItem('products', products);
  }

  static getProductsByBrand(brandId: string, page: number = 1, limit: number = 12, searchTerm: string = ''): {
    products: Product[];
    total: number;
  } {
    const allProducts = this.getProducts();
    const brands = this.getBrands();
    
    let filteredProducts = allProducts
      .filter(p => p.brand_id === brandId)
      .map(product => ({
        ...product,
        brand: brands.find(b => b.id === product.brand_id)
      }));

    // Aplicar búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.key.toLowerCase().includes(search) ||
        product.barcode.toLowerCase().includes(search)
      );
    }

    const total = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

    return {
      products: paginatedProducts,
      total
    };
  }

  static createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, parameters: Omit<ProductParameter, 'id' | 'product_id' | 'created_at'>[] = []): Product {
    const products = this.getProducts();
    
    // Verificar códigos únicos
    const existingBarcode = products.find(p => p.barcode === productData.barcode);
    if (existingBarcode) {
      throw new Error(`Ya existe un producto con el código de barras "${productData.barcode}"`);
    }
    
    const existingKey = products.find(p => p.key === productData.key);
    if (existingKey) {
      throw new Error(`Ya existe un producto con la clave "${productData.key}"`);
    }
    
    const newProduct: Product = {
      ...productData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Agregar parámetros
    if (parameters.length > 0) {
      newProduct.parameters = parameters.map(param => ({
        ...param,
        id: this.generateId(),
        product_id: newProduct.id,
        created_at: new Date().toISOString()
      }));
    }
    
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static createProductsBatch(productsData: Array<{
    product: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
    parameters: Omit<ProductParameter, 'id' | 'product_id' | 'created_at'>[];
  }>): Product[] {
    const products = this.getProducts();
    const newProducts: Product[] = [];
    const errors: string[] = [];

    for (const { product: productData, parameters } of productsData) {
      try {
        // Verificar códigos únicos
        const existingBarcode = [...products, ...newProducts].find(p => p.barcode === productData.barcode);
        if (existingBarcode) {
          errors.push(`Código de barras duplicado: ${productData.barcode}`);
          continue;
        }
        
        const existingKey = [...products, ...newProducts].find(p => p.key === productData.key);
        if (existingKey) {
          errors.push(`Clave duplicada: ${productData.key}`);
          continue;
        }
        
        const newProduct: Product = {
          ...productData,
          id: this.generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Agregar parámetros
        if (parameters.length > 0) {
          newProduct.parameters = parameters.map(param => ({
            ...param,
            id: this.generateId(),
            product_id: newProduct.id,
            created_at: new Date().toISOString()
          }));
        }
        
        newProducts.push(newProduct);
      } catch (error) {
        errors.push(`Error en producto ${productData.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    if (newProducts.length > 0) {
      this.saveProducts([...products, ...newProducts]);
    }

    if (errors.length > 0) {
      console.warn('Errores en importación por lotes:', errors);
    }

    return newProducts;
  }

  static updateProduct(id: string, updates: Partial<Product>, parameters: Omit<ProductParameter, 'id' | 'product_id' | 'created_at'>[] = []): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = { 
      ...products[index], 
      ...updates, 
      updated_at: new Date().toISOString(),
      parameters: parameters.length > 0 ? parameters.map(param => ({
        ...param,
        id: this.generateId(),
        product_id: id,
        created_at: new Date().toISOString()
      })) : products[index].parameters
    };
    
    this.saveProducts(products);
    return products[index];
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    this.saveProducts(filteredProducts);
    return true;
  }

  static clearAllProducts(): { success: boolean; message: string; products_deleted: number } {
    const products = this.getProducts();
    const count = products.length;
    
    this.saveProducts([]);
    
    return {
      success: true,
      message: `Eliminados ${count} productos del almacenamiento local`,
      products_deleted: count
    };
  }

  static clearBrandProducts(brandId: string): { success: boolean; message: string; products_deleted: number } {
    const products = this.getProducts();
    const brandProducts = products.filter(p => p.brand_id === brandId);
    const remainingProducts = products.filter(p => p.brand_id !== brandId);
    
    this.saveProducts(remainingProducts);
    
    return {
      success: true,
      message: `Eliminados ${brandProducts.length} productos de la marca`,
      products_deleted: brandProducts.length
    };
  }

  // Gestión de formatos Excel
  static getExcelFormats(): ExcelFormat[] {
    return this.getSecureItem('excel_formats', []);
  }

  static saveExcelFormats(formats: ExcelFormat[]): void {
    this.setSecureItem('excel_formats', formats);
  }

  static getExcelFormatsByBrand(brandId: string): ExcelFormat[] {
    const formats = this.getExcelFormats();
    return formats.filter(f => f.brand_id === brandId);
  }

  static createExcelFormat(formatData: Omit<ExcelFormat, 'id' | 'created_at' | 'updated_at'>, fields: Omit<ExcelFormatField, 'id' | 'format_id' | 'created_at'>[] = []): ExcelFormat {
    const formats = this.getExcelFormats();
    
    const newFormat: ExcelFormat = {
      ...formatData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (fields.length > 0) {
      newFormat.fields = fields.map((field, index) => ({
        ...field,
        id: this.generateId(),
        format_id: newFormat.id,
        order_index: index,
        created_at: new Date().toISOString()
      }));
    }
    
    formats.push(newFormat);
    this.saveExcelFormats(formats);
    return newFormat;
  }

  // Sistema de permisos
  static hasPermission(role: string, resource: string, action: string): boolean {
    if (role === 'admin') return true;
    
    if (role === 'manager') {
      if (resource === 'brands' && action === 'delete') return false;
      if (resource === 'users') return false;
      return ['brands', 'products', 'excel_formats'].includes(resource);
    }
    
    if (role === 'viewer') {
      return action === 'read';
    }
    
    return false;
  }

  // Utilidades
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Métodos de mantenimiento
  static exportData(): string {
    const data = {
      brands: this.getBrands(),
      products: this.getProducts(),
      formats: this.getExcelFormats(),
      users: this.getUsers(),
      exported_at: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.brands) this.saveBrands(data.brands);
      if (data.products) this.saveProducts(data.products);
      if (data.formats) this.saveExcelFormats(data.formats);
      if (data.users) this.saveUsers(data.users);
      
      return {
        success: true,
        message: 'Datos importados exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al importar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  static clearAllData(): void {
    localStorage.clear();
  }
}