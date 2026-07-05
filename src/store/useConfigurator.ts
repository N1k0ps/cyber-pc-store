import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './useCart'; // Импортируем общий интерфейс

interface ConfiguratorState {
  configurator: Record<string, Product | null>;
  setPart: (category: string, part: Product) => void;
  resetConfigurator: () => void;
}

export const useConfigurator = create<ConfiguratorState>()(
  persist(
    (set) => ({
      configurator: {
        case: null,
        cpu: null,
        motherboard: null,
        gpu: null,
        ram: null,
        psu: null,
        cooling: null,
        storage: null,
      },

      setPart: (category, part) => set((state) => ({
        configurator: { ...state.configurator, [category]: part }
      })),

      resetConfigurator: () => set({
        configurator: {
          case: null, cpu: null, motherboard: null, gpu: null, ram: null, psu: null, cooling: null, storage: null
        }
      })
    }),
    { name: 'cyber-pc-configurator' } // Отдельный ключ в localStorage для сборки
  )
);