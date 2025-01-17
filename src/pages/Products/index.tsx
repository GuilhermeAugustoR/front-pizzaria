/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/toast";
import { X } from "lucide-react";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  price: z
    .string()
    .min(1, "O preço é obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Formato de preço inválido"),
  description: z.string().min(1, "A descrição é obrigatória"),
  category_id: z.string().min(1, "A categoria é obrigatória"),
  banner: z
    .any()
    .refine((files) => files?.length == 1, "A imagem é obrigatória")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Tamanho máximo de 5MB`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Apenas .jpg, .jpeg, .png e .webp são suportados"
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Product = FormValues & { id: string };

const categories = [
  { id: "1", name: "Eletrônicos" },
  { id: "2", name: "Roupas" },
  { id: "3", name: "Alimentos" },
];

export default function Products() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Smartphone",
      price: "999.99",
      description: "Um smartphone avançado",
      category_id: "1",
      banner: undefined,
    },
    {
      id: "2",
      name: "Camiseta",
      price: "29.99",
      description: "Uma camiseta confortável",
      category_id: "2",
      banner: undefined,
    },
  ]);
  const { toast, showToast, hideToast } = useToast();

  const createForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category_id: "",
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category_id: "",
    },
  });

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    form: any
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
      form.setValue("banner", event.target.files, { shouldValidate: true });
    } else {
      setPreviewImage(null);
      setFileName(null);
    }
  };

  const handleImageDelete = (form: any) => {
    form.setValue("banner", undefined, { shouldValidate: true });
    setPreviewImage(null);
    setFileName(null);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  async function onCreateSubmit(values: FormValues) {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newProduct = { ...values, id: (products.length + 1).toString() };
    setProducts([...products, newProduct]);
    setIsSubmitting(false);
    showToast(`O produto "${values.name}" foi criado com sucesso.`);
    createForm.reset();
    setIsCreateOpen(false);
    setPreviewImage(null);
    setFileName(null);
  }

  async function onEditSubmit(values: FormValues) {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProducts(
      products.map((prod) =>
        prod.id === editingProduct?.id ? { ...prod, ...values } : prod
      )
    );
    setIsSubmitting(false);
    showToast(`O produto "${values.name}" foi atualizado com sucesso.`);
    editForm.reset();
    setIsEditOpen(false);
    setEditingProduct(null);
    setPreviewImage(null);
    setFileName(null);
  }

  function handleEditClick(product: Product) {
    setEditingProduct(product);
    editForm.reset(product);
    setIsEditOpen(true);
  }

  function handleDeleteClick(product: Product) {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (deletingProduct) {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProducts(products.filter((prod) => prod.id !== deletingProduct.id));
      setIsSubmitting(false);
      showToast(`O produto "${deletingProduct.name}" foi excluído.`);
      setIsDeleteOpen(false);
      setDeletingProduct(null);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Produtos</h1>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild className="">
          <Button className="mb-4">Criar Novo Produto</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl overflow-y-auto h-[40rem]">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Crie um novo produto para o seu catálogo.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome do produto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="banner"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Banner</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageChange(e, createForm);
                            onChange(e.target.files);
                          }}
                          {...field}
                        />
                        {(previewImage || fileName) && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleImageDelete(createForm)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previewImage && (
                <div className="mt-4">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg"
                  />
                </div>
              )}
              {!previewImage && fileName && (
                <div className="mt-4">
                  <p>Arquivo selecionado: {fileName}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Criar Produto"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto selecionado.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome do produto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="banner"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Banner</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageChange(e, editForm);
                            onChange(e.target.files);
                          }}
                          {...field}
                        />
                        {(previewImage || fileName) && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleImageDelete(editForm)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previewImage && (
                <div className="mt-4">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg"
                  />
                </div>
              )}
              {!previewImage && fileName && (
                <div className="mt-4">
                  <p>Arquivo selecionado: {fileName}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Atualizando..." : "Atualizar Produto"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              produto "{deletingProduct?.name}" e removerá seus dados de nossos
              servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Excluindo..." : "Sim, excluir produto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Existentes</CardTitle>
          <CardDescription>
            Lista de todos os produtos cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between bg-secondary p-2 rounded"
              >
                <div>
                  <span className="font-bold">{product.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    R$ {product.price}
                  </span>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(product)}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {toast && <Toast message={toast.message} onClose={hideToast} />}
    </div>
  );
}
