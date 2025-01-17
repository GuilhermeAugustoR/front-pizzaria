"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
  categoryName: z.string().min(1, "O nome da categoria é obrigatório"),
});

type Category = {
  id: string;
  name: string;
};

export default function Category() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Eletrônicos" },
    { id: "2", name: "Roupas" },
    { id: "3", name: "Alimentos" },
  ]);
  const { toast, showToast, hideToast } = useToast();

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  async function onCreateSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simula uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newCategory = {
      id: (categories.length + 1).toString(),
      name: values.categoryName,
    };
    setCategories([...categories, newCategory]);
    setIsSubmitting(false);
    showToast(`A categoria "${values.categoryName}" foi criada com sucesso.`);
    createForm.reset();
    setIsCreateOpen(false);
  }

  async function onEditSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simula uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCategories(
      categories.map((cat) =>
        cat.id === editingCategory?.id
          ? { ...cat, name: values.categoryName }
          : cat
      )
    );
    setIsSubmitting(false);
    showToast(`A categoria foi atualizada para "${values.categoryName}".`);
    editForm.reset();
    setIsEditOpen(false);
    setEditingCategory(null);
  }

  function handleEditClick(category: Category) {
    setEditingCategory(category);
    editForm.setValue("categoryName", category.name);
    setIsEditOpen(true);
  }

  function handleDeleteClick(category: Category) {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (deletingCategory) {
      setIsSubmitting(true);
      // Simula uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCategories(categories.filter((cat) => cat.id !== deletingCategory.id));
      setIsSubmitting(false);
      showToast(`A categoria "${deletingCategory.name}" foi excluída.`);
      setIsDeleteOpen(false);
      setDeletingCategory(null);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Categorias</h1>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Criar Nova Categoria</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar seus itens.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-8"
            >
              <FormField
                control={createForm.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da categoria"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Criar Categoria"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize o nome da categoria selecionada.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-8"
            >
              <FormField
                control={editForm.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o novo nome da categoria"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Atualizando..." : "Atualizar Categoria"}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              categoria "{deletingCategory?.name}" e removerá seus dados de
              nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Excluindo..." : "Sim, excluir categoria"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Categorias Existentes</CardTitle>
          <CardDescription>
            Lista de todas as categorias criadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between bg-secondary p-2 rounded"
              >
                <span>{category.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(category)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
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
