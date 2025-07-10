import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

// Prefijo para loguear todo
const ggg = (...args) => console.log('ggg CHECKOUT INIT:', ...args);

await initializeDropin(async () => {
  ggg('Iniciando Drop-in Checkout');

  // Paso 2: Setear headers para GraphQL
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));
  ggg('Seteando headers de GraphQL');

  // Paso 3: Cargar placeholders del archivo
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  ggg('Placeholders cargados');

  // Paso 4: Ejecutar el montaje inmediato con transformador OOPE
  ggg('Ejecutando mountImmediately');
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          ggg('Transformando modelo CartModel', data);
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
          };
        },
      },
    },
  });
});
