import { useEffect, useState } from "react";
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
import { CreateOrder, ListOrders } from "@/services/Orders/orderService";

const products = [
  { id: "1", name: "Hambúrguer", price: 15 },
  { id: "2", name: "Batata Frita", price: 8 },
  { id: "3", name: "Pizza", price: 30 },
  { id: "4", name: "Refrigerante", price: 5 },
];

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  table: string;
  name: string;
  status: boolean;
  items: OrderItem[];
  draft: boolean;
  created_at: string;
};

const Home = () => {
  const { toast, showToast, hideToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOrderDetailsVisible, setIsOrderDetailsVisible] = useState(false);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);
  const [errorCreateOrder, setErrorCreateOrder] = useState("");

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
      orders?.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    showToast(`Status do pedido ${orderId} atualizado para ${newStatus}`);
  };

  const handleEditOrder = (orderId: string, updatedItems: OrderItem[]) => {
    setOrders(
      orders?.map((order) =>
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

  const handleGetOrders = async () => {
    try {
      const response = await ListOrders();

      if (response.status === 400) {
        console.log("error", response);
        // setErrorCreateOrder(response.response.data.error);
        // setLoadingCreateOrder(false);
        return;
      }
      setOrders(
        response?.map(
          ({ id, name, status, table, created_at, draft }: Order) => ({
            id: id,
            name: name,
            status: status === false ? "Pendente" : "Finalizado",
            table: table,
            draft: draft,
            created_at: created_at,
          })
        )
      );
      console.log("orders", response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoadingCreateOrder(true);
    try {
      const response = await CreateOrder({
        name: newOrderName,
        table: Number(newOrderNumber),
      });

      if (response.status === 400) {
        console.log("error", response);
        setErrorCreateOrder(response.response.data.error);
        setLoadingCreateOrder(false);
        return;
      }

      const newOrder: Order = {
        id: (orders.length + 1).toString(),
        table: `${newOrderName} - Mesa ${newOrderNumber}`,
        status: false,
        items: [],
        draft: true,
        name: "",
        created_at: "",
        // total: 0,
      };

      setOrders([...orders, newOrder]);
      setIsNewOrderDialogOpen(false);
      setNewOrderName("");
      setNewOrderNumber("");
      showToast(`Novo pedido criado para ${newOrder.table}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCreateOrder(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedOrder || !selectedProductId) return;

    const productToAdd = products.find((p) => p.id === selectedProductId);
    if (!productToAdd) return;

    const updatedItems = [
      ...selectedOrder.items,
      {
        id: Date.now().toString(),
        name: productToAdd.name,
        quantity: productQuantity,
        price: productToAdd.price,
      },
    ];

    const updatedOrder = {
      ...selectedOrder,
      items: updatedItems,
      total: updatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
    };

    setOrders(
      orders?.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
    setIsAddProductDialogOpen(false);
    setSelectedProductId("");
    setProductQuantity(1);
    showToast(`${productToAdd.name} adicionado ao pedido`);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!selectedOrder) return;

    const updatedItems = selectedOrder.items.filter(
      (item) => item.id !== itemId
    );
    const updatedOrder = {
      ...selectedOrder,
      items: updatedItems,
      total: updatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
    };

    setOrders(
      orders?.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
    showToast("Item removido do pedido");
  };

  useEffect(() => {
    handleGetOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Pedidos</h1>
      <Button onClick={() => setIsNewOrderDialogOpen(true)} className="mb-4">
        Novo Pedido
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
            <CardDescription>Lista dos pedidos mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[30rem] overflow-y-auto space-y-4">
              {orders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOrderClick(order)}
                >
                  <div>
                    <h3 className="font-semibold">{order.table}</h3>
                    <p className="text-sm text-gray-500">{order.created_at}</p>
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
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder?.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <p className="font-semibold">
                  {/* Total: R$ {selectedOrder.total.toFixed(2)} */}
                </p>
                <p>Status: {selectedOrder.status}</p>
                <p>Criado em: {selectedOrder.created_at.toLocaleString()}</p>
                <Button onClick={() => setIsAddProductDialogOpen(true)}>
                  Adicionar Produto
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Select
                onValueChange={(value) =>
                  handleStatusChange(
                    selectedOrder.id,
                    value === "Pendente" ? false : true
                  )
                }
                defaultValue={
                  selectedOrder.status === false ? "Pendente" : "Finalizado"
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
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
                      {selectedOrder?.items?.map((item, index) => (
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
                                quantity: Number.parseInt(e.target.value) || 0,
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
                        onClick={() => {
                          handleEditOrder(
                            selectedOrder.id,
                            selectedOrder.items
                          );
                        }}
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

      <Dialog
        open={isNewOrderDialogOpen}
        onOpenChange={setIsNewOrderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pedido</DialogTitle>
            <DialogDescription>
              Insira os detalhes do novo pedido.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={newOrderName}
                  onChange={(e) => setNewOrderName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="table-number" className="text-right">
                  Número da Mesa
                </Label>
                <Input
                  id="table-number"
                  type="number"
                  value={newOrderNumber}
                  onChange={(e) => setNewOrderNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleNewOrderSubmit}>Criar Pedido</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Selecione um produto para adicionar ao pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produto
              </Label>
              <Select
                onValueChange={setSelectedProductId}
                value={selectedProductId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={productQuantity}
                onChange={(e) =>
                  setProductQuantity(Number.parseInt(e.target.value))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddProduct}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {toast && <Toast message={toast.message} onClose={hideToast} />}
    </div>
  );
};
export default Home;
