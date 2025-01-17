import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/toast";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  table: string;
  status: "pending" | "preparing" | "ready" | "delivered";
  items: OrderItem[];
  total: number;
  createdAt: Date;
};

const initialOrders: Order[] = [
  {
    id: "1",
    table: "Mesa 1",
    status: "pending",
    items: [
      { id: "1", name: "Hambúrguer", quantity: 2, price: 15 },
      { id: "2", name: "Batata Frita", quantity: 1, price: 8 },
    ],
    total: 38,
    createdAt: new Date("2023-06-10T14:30:00"),
  },
  {
    id: "2",
    table: "Mesa 3",
    status: "preparing",
    items: [
      { id: "3", name: "Pizza", quantity: 1, price: 30 },
      { id: "4", name: "Refrigerante", quantity: 2, price: 5 },
    ],
    total: 40,
    createdAt: new Date("2023-06-10T15:00:00"),
  },
];

const Home = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOrderDetailsVisible, setIsOrderDetailsVisible] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsVisible(true);
  };

  const handleCloseOrderDetails = () => {
    setIsOrderDetailsVisible(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    showToast(`Status do pedido ${orderId} atualizado para ${newStatus}`);
  };

  const handleEditOrder = (orderId: string, updatedItems: OrderItem[]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: updatedItems,
              total: updatedItems.reduce(
                (sum, item) => sum + item.quantity * item.price,
                0
              ),
            }
          : order
      )
    );
    setIsEditDialogOpen(false);
    showToast(`Pedido ${orderId} atualizado com sucesso`);
  };

  const handleFinalizeOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId));
    setSelectedOrder(null);
    setIsOrderDetailsVisible(false);
    showToast(`Pedido ${orderId} finalizado com sucesso`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
            <CardDescription>Lista dos pedidos mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[30rem] overflow-y-auto space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrderClick(order)}
                >
                  <div>
                    <h3 className="font-semibold">{order.table}</h3>
                    <p className="text-sm text-gray-500">
                      {order.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOrder && isOrderDetailsVisible && (
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>
                  Detalhes do Pedido - {selectedOrder.table}
                </CardTitle>
                <Button variant="ghost" onClick={handleCloseOrderDetails}>
                  Fechar
                </Button>
              </div>
              <CardDescription>Pedido #{selectedOrder.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <p className="font-semibold">
                  Total: R$ {selectedOrder.total.toFixed(2)}
                </p>
                <p>Status: {selectedOrder.status}</p>
                <p>Criado em: {selectedOrder.createdAt.toLocaleString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Select
                onValueChange={(value) =>
                  handleStatusChange(selectedOrder.id, value as Order["status"])
                }
                defaultValue={selectedOrder.status}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2">
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Pedido</DialogTitle>
                      <DialogDescription>
                        Faça alterações nos itens do pedido aqui. Clique em
                        salvar quando terminar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-4 items-center gap-4"
                        >
                          <Label
                            htmlFor={`item-${index}`}
                            className="text-right"
                          >
                            {item.name}
                          </Label>
                          <Input
                            id={`item-${index}`}
                            defaultValue={item.quantity}
                            className="col-span-3"
                            onChange={(e) => {
                              const updatedItems = [...selectedOrder.items];
                              updatedItems[index] = {
                                ...item,
                                quantity: parseInt(e.target.value) || 0,
                              };
                              setSelectedOrder({
                                ...selectedOrder,
                                items: updatedItems,
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={() =>
                          handleEditOrder(selectedOrder.id, selectedOrder.items)
                        }
                      >
                        Salvar alterações
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => handleFinalizeOrder(selectedOrder.id)}>
                  Finalizar
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
      {toast && <Toast message={toast.message} onClose={hideToast} />}
    </div>
  );
};
export default Home;
