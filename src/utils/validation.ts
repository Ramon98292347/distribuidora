// Utilitários de valida??o para o sistema

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProductValidation {
  name: string;
  price: number;
  stock_quantity: number;
  category: string;
  cost_price?: number;
  profit_margin?: number;
}

export interface ClientValidation {
  name: string;
  email?: string;
  phone?: string;
  document_number?: string;
  client_type: 'individual' | 'company';
}

export interface SaleValidation {
  client_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

// Valida��o de produtos
export const validateProduct = (product: ProductValidation): ValidationResult => {
  const errors: string[] = [];

  // Nome obrigatório
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Nome do produto � obrigatório');
  } else if (product.name.trim().length < 2) {
    errors.push('Nome do produto deve ter pelo menos 2 caracteres');
  } else if (product.name.trim().length > 255) {
    errors.push('Nome do produto deve ter no máximo 255 caracteres');
  }

  // Preço obrigatório e válido
  if (product.price === undefined || product.price === null) {
    errors.push('Preço � obrigatório');
  } else if (product.price < 0) {
    errors.push('Preço deve ser maior ou igual a zero');
  } else if (product.price > 999999.99) {
    errors.push('Preço deve ser menor que R$ 999.999,99');
  }

  // Quantidade em estoque
  if (product.stock_quantity === undefined || product.stock_quantity === null) {
    errors.push('Quantidade em estoque � obrigatória');
  } else if (product.stock_quantity < 0) {
    errors.push('Quantidade em estoque deve ser maior ou igual a zero');
  } else if (!Number.isInteger(product.stock_quantity)) {
    errors.push('Quantidade em estoque deve ser um número inteiro');
  }

  // Categoria obrigatória
  if (!product.category || product.category.trim().length === 0) {
    errors.push('Categoria � obrigatória');
  }

  // Preço de custo (opcional, mas se informado deve ser válido)
  if (product.cost_price !== undefined && product.cost_price !== null) {
    if (product.cost_price < 0) {
      errors.push('Preço de custo deve ser maior ou igual a zero');
    } else if (product.cost_price > product.price) {
      errors.push('Preço de custo não pode ser maior que o pre�o de venda');
    }
  }

  // Margem de lucro (opcional, mas se informada deve ser v�lida)
  if (product.profit_margin !== undefined && product.profit_margin !== null) {
    if (product.profit_margin < 0) {
      errors.push('Margem de lucro deve ser maior ou igual a zero');
    } else if (product.profit_margin > 1000) {
      errors.push('Margem de lucro deve ser menor que 1000%');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Valida��o de clientes
export const validateClient = (client: ClientValidation): ValidationResult => {
  const errors: string[] = [];

  // Nome obrigatório
  if (!client.name || client.name.trim().length === 0) {
    errors.push('Nome do cliente � obrigatório');
  } else if (client.name.trim().length < 2) {
    errors.push('Nome do cliente deve ter pelo menos 2 caracteres');
  } else if (client.name.trim().length > 255) {
    errors.push('Nome do cliente deve ter no máximo 255 caracteres');
  }

  // Email (opcional, mas se informado deve ser válido)
  if (client.email && client.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client.email)) {
      errors.push('Email deve ter um formato válido');
    }
  }

  // Telefone (opcional, mas se informado deve ser válido)
  if (client.phone && client.phone.trim().length > 0) {
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(client.phone.replace(/\s/g, ''))) {
      errors.push('Telefone deve ter um formato válido (ex: (11) 99999-9999)');
    }
  }

  // Documento (opcional, mas se informado deve ser válido)
  if (client.document_number && client.document_number.trim().length > 0) {
    const cleanDoc = client.document_number.replace(/[^\d]/g, '');
    
    if (client.client_type === 'individual') {
      // CPF deve ter 11 d�gitos
      if (cleanDoc.length !== 11) {
        errors.push('CPF deve ter 11 d�gitos');
      } else if (!isValidCPF(cleanDoc)) {
        errors.push('CPF inválido');
      }
    } else if (client.client_type === 'company') {
      // CNPJ deve ter 14 d�gitos
      if (cleanDoc.length !== 14) {
        errors.push('CNPJ deve ter 14 d�gitos');
      } else if (!isValidCNPJ(cleanDoc)) {
        errors.push('CNPJ inválido');
      }
    }
  }

  // Tipo de cliente obrigatório
  if (!client.client_type || !['individual', 'company'].includes(client.client_type)) {
    errors.push('Tipo de cliente deve ser "individual" ou "company"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Valida��o de vendas
export const validateSale = (sale: SaleValidation): ValidationResult => {
  const errors: string[] = [];

  // Cliente obrigatório
  if (!sale.client_id || sale.client_id.trim().length === 0) {
    errors.push('Cliente � obrigatório');
  }

  // Itens obrigatórios
  if (!sale.items || sale.items.length === 0) {
    errors.push('Pelo menos um item deve ser adicionado � venda');
  } else {
    sale.items.forEach((item, index) => {
      // Produto obrigatório
      if (!item.product_id || item.product_id.trim().length === 0) {
        errors.push(`Item ${index + 1}: Produto � obrigatório`);
      }

      // Quantidade obrigatória e v�lida
      if (item.quantity === undefined || item.quantity === null) {
        errors.push(`Item ${index + 1}: Quantidade � obrigatória`);
      } else if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
      } else if (!Number.isInteger(item.quantity)) {
        errors.push(`Item ${index + 1}: Quantidade deve ser um número inteiro`);
      }

      // Preço unit�rio obrigatório e válido
      if (item.unit_price === undefined || item.unit_price === null) {
        errors.push(`Item ${index + 1}: Preço unit�rio � obrigatório`);
      } else if (item.unit_price <= 0) {
        errors.push(`Item ${index + 1}: Preço unit�rio deve ser maior que zero`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Valida��o de CPF
const isValidCPF = (cpf: string): boolean => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Valida��o de CNPJ
const isValidCNPJ = (cnpj: string): boolean => {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

// Utilitários de formata��o
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// Sanitiza��o de dados
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>"'&]/g, '');
};

export const sanitizeNumber = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export const sanitizeInteger = (value: any): number => {
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
};
