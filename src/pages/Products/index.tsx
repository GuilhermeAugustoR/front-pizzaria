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
  CardFooter,
} from "@/components/ui/card";
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

const categories = [
  { id: "1", name: "Eletrônicos" },
  { id: "2", name: "Roupas" },
  { id: "3", name: "Alimentos" },
];

export default function Products() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category_id: "",
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleImageDelete = () => {
    form.setValue("banner", undefined, { shouldValidate: true });
    setPreviewImage(null);
    setFileName(null);
    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    // Simula uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Cria um objeto FormData para enviar o arquivo
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("price", values.price);
    formData.append("description", values.description);
    formData.append("category_id", values.category_id);
    if (values.banner instanceof FileList && values.banner.length > 0) {
      formData.append("banner", values.banner[0]);
    }

    console.log(Object.fromEntries(formData));
    setIsSubmitting(false);
    showToast(`O produto "${values.name}" foi criado com sucesso.`);

    // Reset completo do formulário
    form.reset({
      name: "",
      price: "",
      description: "",
      category_id: "",
      banner: undefined,
    });
    setPreviewImage(null);
    setFileName(null);

    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    // Reset the category select
    // form.setValue("category_id", "", { shouldValidate: true });
  }

  return (
    <div className="flex flex-col h-screen justify-center bg-slate-200">
      <Card className="w-full max-w-2xl h-[90%] mx-auto overflow-x-auto">
        <CardHeader>
          <CardTitle>Novo Produto</CardTitle>
          <CardDescription>
            Crie um novo produto para o seu catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                            handleImageChange(e);
                            onChange(e.target.files);
                          }}
                          {...field}
                        />
                        {(previewImage || fileName) && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleImageDelete}
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
                    src={previewImage}
                    alt="Preview"
                    className="max-w-lg h-auto rounded-lg"
                  />
                </div>
              )}
              {!previewImage && fileName && (
                <div className="mt-4">
                  <p>Arquivo selecionado: {fileName}</p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Criar Produto"}
          </Button>
        </CardFooter>
      </Card>
      {toast && <Toast message={toast.message} onClose={hideToast} />}
    </div>
  );
}
