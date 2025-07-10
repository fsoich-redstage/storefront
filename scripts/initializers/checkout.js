import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

console.log('www CHECKOUT INIT: Iniciando Drop-in Checkout');

await initializeDropin(async () => {
  console.log('www CHECKOUT INIT: Seteando headers de GraphQL');
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  console.log('www CHECKOUT INIT: Cargando placeholders...');
  const labels = await fetchPlaceholders('placeholders/checkout.json');

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  console.log('www CHECKOUT INIT: Ejecutando mountImmediately');

  const result = initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('www CHECKOUT DEBUG: CartModel raw data:', JSON.stringify(data, null, 2));
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            availableShippingMethods: data?.shipping_addresses?.[0]?.available_shipping_methods,
            selectedShippingMethod: data?.shipping_addresses?.[0]?.selected_shipping_method,
          };
        },
      },
    },
  });

  // Fallback: escuchamos eventos globales desde window
  if (typeof window !== 'undefined' && window.addEventListener) {
    console.log('www CHECKOUT INIT: Registrando eventos globales via window');

    window.addEventListener('message', (e) => {
      if (!e?.data?.type?.startsWith('checkout/')) return;

      console.log(`www GLOBAL EVENT: ${e.data.type} →`, e.data?.payload);
    });
  }

  console.log('www CHECKOUT INIT: Listo y esperando eventos (global fallback)');
  return result;
});
