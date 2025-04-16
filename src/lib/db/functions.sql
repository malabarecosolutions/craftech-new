
-- Function to reduce stock when order is confirmed
CREATE OR REPLACE FUNCTION reduce_material_stock() 
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.order_status = 'confirmed' AND OLD.order_status != 'confirmed') THEN
    -- Update material stock
    UPDATE materials
    SET current_stock = current_stock - NEW.material_qty
    WHERE id = NEW.material_id
    AND current_stock >= NEW.material_qty;
    
    -- Check if update was successful
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for material ID %', NEW.material_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function
DROP TRIGGER IF EXISTS trigger_reduce_stock ON orders;
CREATE TRIGGER trigger_reduce_stock
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION reduce_material_stock();
