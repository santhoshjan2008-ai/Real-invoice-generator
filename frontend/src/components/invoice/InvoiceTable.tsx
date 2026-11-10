import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import type { LineItem } from '../../types';

interface InvoiceTableProps {
  items: LineItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof LineItem, value: string | number) => void;
}

export default function InvoiceTable({
  items,
  onAdd,
  onRemove,
  onChange,
}: InvoiceTableProps) {
  const calculateTotal = (qty: number, unitPrice: number, taxRate: number) =>
    qty * unitPrice * (1 + taxRate / 100);

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
              <th className="pb-3 pr-3">Description</th>
              <th className="w-20 pb-3 pr-3 text-center">Qty</th>
              <th className="w-28 pb-3 pr-3 text-right">Unit Price</th>
              <th className="w-20 pb-3 pr-3 text-center">Tax %</th>
              <th className="w-28 pb-3 pr-3 text-right">Total</th>
              <th className="w-12 pb-3"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const total = calculateTotal(
                  item.quantity,
                  item.unitPrice,
                  item.taxRate || 0
                );
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-100"
                  >
                    <td className="py-3 pr-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          onChange(item.id, 'description', e.target.value)
                        }
                        placeholder="Item description"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) =>
                          onChange(
                            item.id,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          onChange(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-right text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={item.taxRate}
                        onChange={(e) =>
                          onChange(
                            item.id,
                            'taxRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </td>
                    <td className="py-3 pr-3 text-right text-sm font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Layout */}
      <div className="flex flex-col gap-4 md:hidden">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const total = calculateTotal(
              item.quantity,
              item.unitPrice,
              item.taxRate || 0
            );
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Line Item
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        onChange(item.id, 'description', e.target.value)
                      }
                      placeholder="Item description"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Qty
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) =>
                          onChange(
                            item.id,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          onChange(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Tax %
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={item.taxRate}
                        onChange={(e) =>
                          onChange(
                            item.id,
                            'taxRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                      />
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold text-gray-900">
                    Total: ${total.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}
