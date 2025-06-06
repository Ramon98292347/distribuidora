
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading clients:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .insert([client]);

      if (error) {
        toast({
          title: "Erro ao adicionar cliente",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadClients();
      toast({
        title: "Cliente adicionado!",
        description: `${client.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao atualizar cliente",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadClients();
      toast({
        title: "Cliente atualizado!",
        description: "Cliente foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Erro ao deletar cliente",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await loadClients();
      toast({
        title: "Cliente deletado!",
        description: "Cliente foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro ao deletar cliente",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const refreshClients = async () => {
    await loadClients();
  };

  return (
    <ClientContext.Provider value={{
      clients,
      addClient,
      updateClient,
      deleteClient,
      refreshClients
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
