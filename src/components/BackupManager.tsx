import React, { useState, useRef } from 'react';
import { backupService, BackupData, BackupOptions } from '../utils/backup';

interface BackupManagerProps {
  onBackupComplete?: (success: boolean, message: string) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ onBackupComplete }) => {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupData | null>(null);
  const [integrityResult, setIntegrityResult] = useState<any>(null);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeTables: [],
    excludeTables: [],
    dateRange: undefined
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTables = [
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

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      
      const options: BackupOptions = {
        ...backupOptions,
        includeTables: backupOptions.includeTables?.length ? backupOptions.includeTables : undefined
      };
      
      const backupData = await backupService.createFullBackup(options);
      setLastBackup(backupData);
      
      await backupService.exportBackupToFile(backupData);
      
      onBackupComplete?.(true, `Backup criado com sucesso! ${backupData.metadata.total_records} registros, ${backupData.metadata.backup_size}`);
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      onBackupComplete?.(false, `Erro ao criar backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      setLoading(true);
      
      const backupData = await backupService.importBackupFromFile(file);
      setLastBackup(backupData);
      
      onBackupComplete?.(true, `Backup importado com sucesso! ${backupData.metadata.total_records} registros`);
    } catch (error: any) {
      console.error('Erro ao importar backup:', error);
      onBackupComplete?.(false, `Erro ao importar backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (clearExisting: boolean = false) => {
    if (!lastBackup) {
      onBackupComplete?.(false, 'Nenhum backup carregado para restaurar');
      return;
    }

    const confirmMêssage = clearExisting 
      ? 'ATEN��O: Isso ir� APAGAR todos os dados existentes e restaurar do backup. Tem certeza?'
      : 'Isso ir� restaurar os dados do backup (mantendo dados existentes). Continuar?';
    
    if (!window.confirm(confirmMêssage)) {
      return;
    }

    try {
      setLoading(true);
      
      await backupService.restoreFromBackup(lastBackup, { clearExisting });
      
      onBackupComplete?.(true, 'Dados restaurados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      onBackupComplete?.(false, `Erro ao restaurar backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIntegrity = async () => {
    try {
      setLoading(true);
      
      const result = await backupService.checkDataIntegrity();
      setIntegrityResult(result);
      
      const message = result.isValid 
        ? 'Verifica??o conclu�da: Dados ?ntegros!' 
        : `Verifica??o conclu�da: ${result.issues.length} problemas encontrados`;
      
      onBackupComplete?.(result.isValid, message);
    } catch (error: any) {
      console.error('Erro na verifica��o de integridade:', error);
      onBackupComplete?.(false, `Erro na verifica��o: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelection = (tableName: string, selected: boolean) => {
    setBackupOptions(prev => {
      const includeTables = prev.includeTables || [];
      
      if (selected) {
        return {
          ...prev,
          includeTables: [...includeTables.filter(t => t !== tableName), tableName]
        };
      } else {
        return {
          ...prev,
          includeTables: includeTables.filter(t => t !== tableName)
        };
      }
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setBackupOptions(prev => ({
      ...prev,
      dateRange: {
        start: field === 'start' ? value : prev.dateRange?.start || '',
        end: field === 'end' ? value : prev.dateRange?.end || ''
      }
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🗄️ Gerenciador de Backup</h2>
      
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '8px', 
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
            <p>Processando...</p>
          </div>
        </div>
      )}

      {/* Se��o de Cria��o de Backup */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📤 Criar Backup</h3>
        
        {/* Sele��o de Tabelas */}
        <div style={{ marginBottom: '15px' }}>
          <h4>Tabelas para incluir no backup:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {availableTables.map(table => (
              <label key={table} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={!backupOptions.includeTables?.length || backupOptions.includeTables.includes(table)}
                  onChange={(e) => handleTableSelection(table, e.target.checked)}
                />
                <span>{table}</span>
              </label>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Se nenhuma tabela for selecionada, todas serão inclu�das.
          </p>
        </div>

        {/* Filtro de Data */}
        <div style={{ marginBottom: '15px' }}>
          <h4>Filtro de Data (opcional):</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>
              De:
              <input
                type="date"
                value={backupOptions.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                style={{ marginLeft: '5px', padding: '5px' }}
              />
            </label>
            <label>
              At?:
              <input
                type="date"
                value={backupOptions.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                style={{ marginLeft: '5px', padding: '5px' }}
              />
            </label>
            <button
              onClick={() => setBackupOptions(prev => ({ ...prev, dateRange: undefined }))}
              style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Limpar
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Aplica-se apenas a vendas, compras e movimenta??es de estoque.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          📤 Criar e Baixar Backup
        </button>
      </div>

      {/* Se��o de Importa��o/Restaura��o */}
      <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📥 Importar e Restaurar Backup</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImportBackup(file);
              }
            }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            📁 Selecionar Arquivo de Backup
          </button>
        </div>

        {lastBackup && (
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
            <h4>Backup Carregado:</h4>
            <p><strong>Data:</strong> {new Date(lastBackup.timestamp).toLocaleString('pt-BR')}</p>
            <p><strong>Versão:</strong> {lastBackup.version}</p>
            <p><strong>Registros:</strong> {lastBackup.metadata.total_records}</p>
            <p><strong>Tamanho:</strong> {lastBackup.metadata.backup_size}</p>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleRestoreBackup(false)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Restaurar (Manter Dados Existentes)
              </button>
              
              <button
                onClick={() => handleRestoreBackup(true)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ⚠️ Restaurar (Substituir Todos os Dados)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Se��o de Verifica??o de Integridade */}
      <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔍 Verifica??o de Integridade</h3>
        
        <button
          onClick={handleCheckIntegrity}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          🔍 Verificar Integridade dos Dados
        </button>

        {integrityResult && (
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
            <h4>Resultado da Verifica??o:</h4>
            
            <div style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              backgroundColor: integrityResult.isValid ? '#d4edda' : '#f8d7da',
              color: integrityResult.isValid ? '#155724' : '#721c24',
              marginBottom: '15px'
            }}>
              {integrityResult.isValid ? '✅ Dados ?ntegros!' : `❌ ${integrityResult.issues.length} problemas encontrados`}
            </div>

            {/* Resumo das Tabelas */}
            <div style={{ marginBottom: '15px' }}>
              <h5>Resumo das Tabelas:</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {Object.entries(integrityResult.summary).map(([table, count]) => (
                  <div key={table} style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{table}:</span>
                    <strong>{count} registros</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Problemas */}
            {integrityResult.issues.length > 0 && (
              <div>
                <h5>Problemas Encontrados:</h5>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {integrityResult.issues.map((issue, index) => (
                    <li key={index} style={{ color: '#721c24', marginBottom: '5px' }}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informa??es e Dicas */}
      <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
        <h3>💡 Dicas Importantes</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Fa�a backups regulares dos seus dados</li>
          <li>Teste a restaura??o periodicamente</li>
          <li>Mantenha backups em locais seguros</li>
          <li>Use a verifica��o de integridade para detectar problemas</li>
          <li>A op??o "Substituir Todos os Dados" � irrevers�vel</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupManager;
