// Sistema de backup e recupera��o de dados
import { supabase } from '@/integrations/supabase/client';

export interface BackupData {
  timestamp: string;
  version: string;
  tables: {
    products: any[];
    clients: any[];
    sales: any[];
    sale_items: any[];
    product_images: any[];
    users: any[];
    purchases: any[];
    purchase_items: any[];
    stock_movements: any[];
    product_categories: any[];
  };
  metadata: {
    total_records: number;
    backup_size: string;
    created_by: string;
  };
}

export interface BackupOptions {
  includeTables?: string[];
  excludeTables?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

class BackupService {
  private readonly BACKUP_VERSION = '1.0.0';
  private readonly DEFAULT_TABLES = [
    'products',
    'clients', 
    'sales',
    'sale_items',
    'product_images',
    'users',
    'purchases',
    'purchase_items',
    'stock_movements',
    'product_categories'
  ];

  // Criar backup completo
  async createFullBackup(options: BackupOptions = {}): Promise<BackupData> {
    try {
      console.log('Iniciando backup completo...');
      
      const tablesToBackup = options.includeTables || this.DEFAULT_TABLES;
      const excludedTables = options.excludeTables || [];
      const finalTables = tablesToBackup.filter(table => !excludedTables.includes(table));
      
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: this.BACKUP_VERSION,
        tables: {} as any,
        metadata: {
          total_records: 0,
          backup_size: '0 KB',
          created_by: 'Sistema'
        }
      };

      let totalRecords = 0;

      // Fazer backup de cada tabela
      for (const tableName of finalTables) {
        try {
          console.log(`Fazendo backup da tabela: ${tableName}`);
          
          let query = supabase.from(tableName).select('*');
          
          // Aplicar filtro de data se especificado
          if (options.dateRange && ['sales', 'purchases', 'stock_movements'].includes(tableName)) {
            const dateColumn = tableName === 'sales' ? 'sale_date' : 
                             tableName === 'purchases' ? 'purchase_date' : 'created_at';
            query = query.gte(dateColumn, options.dateRange.start)
                        .lte(dateColumn, options.dateRange.end);
          }
          
          const { data, error } = await query;
          
          if (error) {
            console.warn(`Erro ao fazer backup da tabela ${tableName}:`, error);
            backupData.tables[tableName as keyof typeof backupData.tables] = [];
          } else {
            backupData.tables[tableName as keyof typeof backupData.tables] = data || [];
            totalRecords += (data || []).length;
            console.log(`✓ Backup da tabela ${tableName}: ${(data || []).length} registros`);
          }
        } catch (err) {
          console.warn(`Erro ao processar tabela ${tableName}:`, err);
          backupData.tables[tableName as keyof typeof backupData.tables] = [];
        }
      }

      // Calcular metadados
      backupData.metadata.total_records = totalRecords;
      const backupSize = new Blob([JSON.stringify(backupData)]).size;
      backupData.metadata.backup_size = this.formatFileSize(backupSize);
      
      console.log(`✅ Backup conclu�do: ${totalRecords} registros, ${backupData.metadata.backup_size}`);
      
      return backupData;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw new Error(`Falha ao criar backup: ${error}`);
    }
  }

  // Exportar backup para arquivo JSON
  async exportBackupToFile(backupData: BackupData, filename?: string): Promise<void> {
    try {
      const defaultFilename = `backup_jeser_bebidas_${new Date().toISOString().split('T')[0]}.json`;
      const finalFilename = filename || defaultFilename;
      
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Criar link de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      
      // Simular clique para download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL
      URL.revokeObjectURL(url);
      
      console.log(`✅ Backup exportado: ${finalFilename}`);
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      throw new Error(`Falha ao exportar backup: ${error}`);
    }
  }

  // Importar backup de arquivo
  async importBackupFromFile(file: File): Promise<BackupData> {
    try {
      console.log('Importando backup do arquivo...');
      
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validar estrutura do backup
      if (!this.validateBackupStructure(backupData)) {
        throw new Error('Arquivo de backup inválido ou corrompido');
      }
      
      console.log(`✅ Backup importado: vers�o ${backupData.version}, ${backupData.metadata.total_records} registros`);
      
      return backupData;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      throw new Error(`Falha ao importar backup: ${error}`);
    }
  }

  // Restaurar dados do backup
  async restoreFromBackup(backupData: BackupData, options: { 
    clearExisting?: boolean;
    tablesToRestore?: string[];
  } = {}): Promise<void> {
    try {
      console.log('Iniciando restaura??o do backup...');
      
      const { clearExisting = false, tablesToRestore } = options;
      const tablesToProcess = tablesToRestore || Object.keys(backupData.tables);
      
      for (const tableName of tablesToProcess) {
        const tableData = backupData.tables[tableName as keyof typeof backupData.tables];
        
        if (!tableData || tableData.length === 0) {
          console.log(`⏭️ Pulando tabela ${tableName}: sem dados`);
          continue;
        }
        
        try {
          console.log(`Restaurando tabela ${tableName}: ${tableData.length} registros`);
          
          // Limpar dados existentes se solicitado
          if (clearExisting) {
            console.log(`🗑️ Limpando dados existentes da tabela ${tableName}`);
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos exceto um ID imposs�vel
            
            if (deleteError) {
              console.warn(`Aviso ao limpar tabela ${tableName}:`, deleteError);
            }
          }
          
          // Inserir dados em lotes para evitar timeouts
          const batchSize = 100;
          for (let i = 0; i < tableData.length; i += batchSize) {
            const batch = tableData.slice(i, i + batchSize);
            
            const { error: insertError } = await supabase
              .from(tableName)
              .upsert(batch, { onConflict: 'id' });
            
            if (insertError) {
              console.warn(`Erro ao inserir lote ${Math.floor(i/batchSize) + 1} da tabela ${tableName}:`, insertError);
            } else {
              console.log(`✓ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(tableData.length/batchSize)} da tabela ${tableName}`);
            }
          }
          
          console.log(`✅ Tabela ${tableName} restaurada com sucesso`);
        } catch (err) {
          console.error(`Erro ao restaurar tabela ${tableName}:`, err);
        }
      }
      
      console.log('🎉 Restaura��o do backup conclu�da!');
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw new Error(`Falha ao restaurar backup: ${error}`);
    }
  }

  // Validar estrutura do backup
  private validateBackupStructure(data: any): boolean {
    try {
      return (
        data &&
        typeof data === 'object' &&
        data.timestamp &&
        data.version &&
        data.tables &&
        data.metadata &&
        typeof data.tables === 'object' &&
        typeof data.metadata === 'object'
      );
    } catch {
      return false;
    }
  }

  // Formatar tamanho do arquivo
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Criar backup automático (pode ser chamado periodicamente)
  async createAutomaticBackup(): Promise<void> {
    try {
      console.log('Executando backup automático...');
      
      const backupData = await this.createFullBackup({
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // ?ltimos 30 dias
          end: new Date().toISOString()
        }
      });
      
      await this.exportBackupToFile(backupData, `backup_automatico_${Date.now()}.json`);
      
      console.log('✅ Backup automático conclu�do');
    } catch (error) {
      console.error('Erro no backup automático:', error);
    }
  }

  // Verificar integridade dos dados
  async checkDataIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
    summary: Record<string, number>;
  }> {
    const issues: string[] = [];
    const summary: Record<string, number> = {};
    
    try {
      console.log('Verificando integridade dos dados...');
      
      // Verificar cada tabela
      for (const tableName of this.DEFAULT_TABLES) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            issues.push(`Erro ao acessar tabela ${tableName}: ${error.message}`);
            summary[tableName] = 0;
          } else {
            summary[tableName] = count || 0;
          }
        } catch (err) {
          issues.push(`Falha ao verificar tabela ${tableName}: ${err}`);
          summary[tableName] = 0;
        }
      }
      
      // Verifica��es específicas de integridade
      
      // 1. Verificar se existem vendas sem itens
      const { data: salesWithoutItems } = await supabase
        .from('sales')
        .select(`
          id,
          sale_items(id)
        `)
        .is('sale_items.id', null);
      
      if (salesWithoutItems && salesWithoutItems.length > 0) {
        issues.push(`${salesWithoutItems.length} vendas encontradas sem itens`);
      }
      
      // 2. Verificar se existem itens de venda ?órfãos
      const { data: orphanSaleItems } = await supabase
        .from('sale_items')
        .select(`
          id,
          sales(id)
        `)
        .is('sales.id', null);
      
      if (orphanSaleItems && orphanSaleItems.length > 0) {
        issues.push(`${orphanSaleItems.length} itens de venda ?órfãos encontrados`);
      }
      
      // 3. Verificar produtos com estoque negativo
      const { data: negativeStock } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lt('stock_quantity', 0);
      
      if (negativeStock && negativeStock.length > 0) {
        issues.push(`${negativeStock.length} produtos com estoque negativo`);
      }
      
      console.log(`Verifica??o de integridade concluída: ${issues.length} problemas encontrados`);
      
      return {
        isValid: issues.length === 0,
        issues,
        summary
      };
    } catch (error) {
      console.error('Erro na verifica��o de integridade:', error);
      return {
        isValid: false,
        issues: [`Erro na verifica��o: ${error}`],
        summary
      };
    }
  }
}

// Instância singleton do serviço de backup
export const backupService = new BackupService();

// Fun??es de conveniência para uso direto
export const createBackup = (options?: BackupOptions) => backupService.createFullBackup(options);
export const exportBackup = (backupData: BackupData, filename?: string) => backupService.exportBackupToFile(backupData, filename);
export const importBackup = (file: File) => backupService.importBackupFromFile(file);
export const restoreBackup = (backupData: BackupData, options?: { clearExisting?: boolean; tablesToRestore?: string[] }) => backupService.restoreFromBackup(backupData, options);
export const checkIntegrity = () => backupService.checkDataIntegrity();
