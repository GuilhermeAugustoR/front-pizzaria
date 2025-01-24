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
import {
  AddItemToOrder,
  CreateOrder,
  FinishOrder,
  ListOrders,
  SendOrder,
} from "@/services/Orders/orderService";
import { ListCategory } from "@/services/Category/categoryService";
import { ListProduct } from "@/services/Product/productService";
import Spinner from "@/components/spinner";

type OrderProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
};
type OrderItem = {
  id: string;
  name: string;
  amount: number;
  product?: OrderProduct;
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

type Product = {
  id: string;
  name: string;
  price: number;
};
type Categories = {
  id: string;
  name: string;
};

const Home = () => {
  const { toast, showToast, hideToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAddProduct, setLoadingAddProduct] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOrderDetailsVisible, setIsOrderDetailsVisible] = useState(false);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);
  const [error, setError] = useState("");

  const handleStatus = (status: boolean, draft: boolean) => {
    const newStatus = status.toString();

    if ((newStatus === "Aberta" || status === false) && draft === true) {
      return "Aberta";
    } else if (
      (newStatus === "Pendente" || status === false) &&
      draft === false
    ) {
      return "Pendente";
    } else {
      return "Finalizado";
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsVisible(true);
  };

  const handleCloseOrderDetails = () => {
    setIsOrderDetailsVisible(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setLoadingAddProduct(true);
    setError("");
    try {
      const response = await SendOrder(orderId);
      if (response.status === 400) {
        console.log("error", response);
        setError(response.response.data.error);
        showToast(response.response.data.error);
        return;
      }

      setOrders(
        orders?.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      showToast(`Status do pedido ${orderId} atualizado para "Pendente"`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAddProduct(false);
    }
  };

  const handleEditOrder = (orderId: string, updatedItems: OrderItem[]) => {
    setOrders(
      orders?.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: updatedItems,
            }
          : order
      )
    );
    setIsEditDialogOpen(false);
    showToast(`Pedido ${orderId} atualizado com sucesso`);
  };

  const handleFinalizeOrder = async (orderId: string) => {
    setError("");
    try {
      const response = await FinishOrder(orderId);

      if (response.status === 400) {
        console.log("error", response);
        setError(response.response.data.error);
        showToast(response.response.data.error);
        return;
      }

      setOrders(orders.filter((order) => order.id !== orderId));
      setSelectedOrder(null);
      setIsOrderDetailsVisible(false);
      showToast(`Pedido ${orderId} finalizado com sucesso`);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetOrders = async () => {
    setLoadingOrders(true);
    setError("");
    try {
      const response = await ListOrders();

      if (response.status === 400) {
        console.log("error", response);
        setLoadingOrders(false);
        setError(response.response.data.error);
        showToast(response.response.data.error);
        // setLoadingCreateOrder(false);
        return;
      }

      setOrders(
        response?.map(
          ({ id, name, status, table, created_at, draft, items }: Order) => ({
            id: id,
            name: name,
            status: handleStatus(status, draft),
            table: table,
            draft: draft,
            items: items,
            created_at: created_at,
          })
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingCreateOrder(true);
    try {
      const response = await CreateOrder({
        name: newOrderName,
        table: Number(newOrderNumber),
      });

      if (response.status === 400) {
        console.log("error", response);
        setError(response.response.data.error);
        showToast(response.response.data.error);
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

  const handleAddProduct = async () => {
    if (!selectedOrder || !selectedProductId) return;

    const productToAdd = products.find((p) => p.id === selectedProductId);
    if (!productToAdd) return;

    setError("");
    setLoadingAddProduct(true);
    try {
      const response = await AddItemToOrder({
        order_id: selectedOrder.id,
        product_id: selectedProductId,
        amount: Number(productQuantity),
      });

      if (response.status === 400) {
        console.log("error", response);
        setError(response.response.data.error);
        showToast(response.response.data.error);
        setLoadingAddProduct(false);
        return;
      }

      const updatedItems = [
        ...selectedOrder.items,
        {
          id: Date.now().toString(),
          name: productToAdd.name,
          amount: productQuantity,
          price: productToAdd.price,
        },
      ];

      const updatedOrder = {
        ...selectedOrder,
        items: updatedItems,
        // total: updatedItems.reduce(
        //   (sum, item) => sum + item.amount * item.price,
        //   0
        // ),
      };

      setOrders(
        orders?.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setSelectedOrder(updatedOrder);
      setIsAddProductDialogOpen(false);
      setSelectedProductId("");
      // setProductQuantity(1);
      showToast(`${productToAdd.name} adicionado ao pedido`);
      handleStatusChange(selectedOrder.id, selectedOrder.status);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (!selectedOrder) return;

    const updatedItems = selectedOrder.items.filter(
      (item) => item.id !== itemId
    );
    const updatedOrder = {
      ...selectedOrder,
      items: updatedItems,
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

  useEffect(() => {
    const handleGetCategory = async () => {
      setLoadingCategories(true);
      setError("");
      try {
        const response = await ListCategory();

        if (response.status === 400) {
          console.log("aqui", response);
          setError(response.response.data.error);
          showToast(response.response.data.error);
          setLoadingCategories(false);
          return;
        }

        setCategories(
          response.map((category: { id: string; name: string }) => ({
            id: category.id,
            name: category.name,
          }))
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingCategories(false);
      }
    };

    handleGetCategory();
  }, []);

  useEffect(() => {
    const handleGetProducts = async () => {
      setLoadingProducts(true);
      setError("");

      try {
        const response = await ListProduct(selectedCategoryId);

        if (response.status === 400) {
          setError(response.response.data.error);
          showToast(response.response.data.error);
          setProducts([]);
          return;
        } else {
          setProducts(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    };

    handleGetProducts();
  }, [selectedCategoryId]);

  return (
    <div className="container mx-auto p-4 bg-slate-200">
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
              {loadingOrders ? (
                <Spinner />
              ) : (
                <>
                  {orders?.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div>
                        <h3 className="font-semibold">{order.table}</h3>
                        <p className="text-sm text-gray-500">
                          {order.created_at}
                        </p>
                      </div>
                      <div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {handleStatus(order.status, order.draft)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
                      <TableCell>{selectedOrder?.name}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>
                        R$ {Number(item.product?.price)?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        R${" "}
                        {Number(
                          item.amount * Number(item.product?.price)
                        )?.toFixed(2)}
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
              {/* <Select
                onValueChange={(value) =>
                  handleStatusChange(
                    selectedOrder.id,
                    value === "Pendente" || value === "Aberta" ? false : true
                  )
                }
                defaultValue={handleStatus(
                  selectedOrder.status,
                  selectedOrder.draft
                )}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberta">Aberta</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select> */}
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
                            defaultValue={item.amount}
                            className="col-span-3"
                            onChange={(e) => {
                              const updatedItems = [...selectedOrder.items];
                              updatedItems[index] = {
                                ...item,
                                amount: Number.parseInt(e.target.value) || 0,
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
              <Button
                onClick={handleNewOrderSubmit}
                disabled={
                  loadingCreateOrder || !newOrderName || !newOrderNumber
                }
              >
                {loadingCreateOrder ? <Spinner /> : "Criar Pedido"}
              </Button>
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
                Categoria
              </Label>
              <Select
                onValueChange={setSelectedCategoryId}
                value={selectedCategoryId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <Spinner />
                  ) : (
                    <>
                      {categories?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produto
              </Label>
              <Select
                onValueChange={setSelectedProductId}
                value={selectedProductId}
                disabled={!selectedCategoryId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {loadingProducts ? (
                    <Spinner />
                  ) : (
                    <>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
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
                disabled={!selectedProductId}
                value={productQuantity}
                onChange={(e) =>
                  setProductQuantity(Number.parseInt(e.target.value))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddProduct}
              disabled={
                loadingAddProduct ||
                !selectedCategoryId ||
                !productQuantity ||
                !selectedProductId
              }
            >
              {loadingAddProduct ? <Spinner /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {toast && (
        <Toast message={toast.message} error={!!error} onClose={hideToast} />
      )}
    </div>
  );
};
export default Home;
