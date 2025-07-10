import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

console.log('INIT: Empezando initialization del Drop-in Checkout');

await initializeDropin(async () => {
  console.log('INIT: Seteando headers de GraphQL');
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  console.log('INIT: Cargando placeholders...');
  const labels = await fetchPlaceholders('placeholders/checkout.json');

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  console.log('INIT: Ejecutando initializers.mountImmediately con OOPE models');

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('INIT: Transformando CartModel data:', data);
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
          };
        },
      },
    },
  });
});

console.log('INIT: Checkout initializer listo');
