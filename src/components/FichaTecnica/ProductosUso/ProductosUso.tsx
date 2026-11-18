import { ChangeEvent, useState } from 'react';
import AutoTextarea from '../../common/AutoTextarea';
import { readImageAsDataUrl } from '../../../lib/images';
import './ProductosUso.css';

interface ProductoUso {
  id: number;
  nombre: string;
  imagen: string;
}

interface ProductosUsoProps {
  productos: ProductoUso[];
  onAddProducto: () => void;
  onRemoveProducto: (id: number) => void;
  onProductoChange: (id: number, field: 'nombre' | 'imagen', value: string) => void;
}

const ProductosUso = ({
  productos,
  onAddProducto,
  onRemoveProducto,
  onProductoChange,
}: ProductosUsoProps) => {
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, id: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await readImageAsDataUrl(file);
    onProductoChange(id, 'imagen', imageUrl);
    setActiveProductId(null);
    event.target.value = '';
  };

  return (
    <div className="productos-uso">
      <div className="productos-uso-header">
        <h2 className="section-title">PRODUCTOS A USAR</h2>
      </div>

      <div className="productos-uso-track">
        {productos.map((producto) => (
          <div key={producto.id} className="producto-card" onClick={() => setActiveProductId(producto.id)}>
            {productos.length > 1 && (
              <button
                type="button"
                className="producto-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProducto(producto.id);
                }}
              >
                ×
              </button>
            )}

            <div className="producto-preview-area">
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre || 'Producto'} />
              ) : (
                <div className="producto-empty-state">Sin imagen</div>
              )}
            </div>

            <AutoTextarea
              className="producto-name-input"
              name={`producto-${producto.id}`}
              value={producto.nombre}
              onChange={(e) => onProductoChange(producto.id, 'nombre', e.target.value)}
              placeholder="Nombre del producto"
              minHeight={40}
            />
          </div>
        ))}

        <button type="button" className="producto-add-card" onClick={onAddProducto}>
          <span>+</span>
          <small>Agregar producto</small>
        </button>
      </div>

      {activeProductId !== null && (
        <div className="producto-modal-overlay" onClick={() => setActiveProductId(null)}>
          <div className="producto-modal" onClick={(e) => e.stopPropagation()}>
            <div className="producto-modal-header">
              <h3>Agregar o cambiar imagen</h3>
              <button type="button" className="producto-modal-close" onClick={() => setActiveProductId(null)}>
                ×
              </button>
            </div>

            <div className="producto-modal-body">
              <div className="producto-modal-field">
                <label htmlFor={`producto-nombre-${activeProductId}`}>Nombre del producto</label>
                <AutoTextarea
                  id={`producto-nombre-${activeProductId}`}
                  name={`producto-nombre-${activeProductId}`}
                  value={productos.find((producto) => producto.id === activeProductId)?.nombre ?? ''}
                  onChange={(e) => onProductoChange(activeProductId, 'nombre', e.target.value)}
                  placeholder="Nombre del producto"
                  className="producto-modal-input"
                  minHeight={40}
                />
              </div>

              <label className="producto-modal-field">
                <span>Imagen del producto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, activeProductId)}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosUso;
