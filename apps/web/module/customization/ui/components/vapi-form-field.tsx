import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "./customization-form";
import { useVapiAssistants, useVapiPhoneNumbers } from "@/hooks/use-vapi-data";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface VapiFormFieldProps {
  form: UseFormReturn<FormSchema>;
}

export const VapiFormField = ({ form }: VapiFormFieldProps) => {
  const { data: assistants, isLoading: assistantLoading } = useVapiAssistants();
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } =
    useVapiPhoneNumbers();

  const disabled = form.formState.isSubmitting;

  return (
    <div className="space-y-2">
      <FormField
        name="vapiSettings.assistantId"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voice Message</FormLabel>
            <FormDescription>
              The Vapi assistant used for voice calls
            </FormDescription>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={assistantLoading || disabled}
              >
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue
                      placeholder={
                        assistantLoading
                          ? "Loading assistants"
                          : "Select an assistance"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-border">
                  <SelectItem className="cursor-pointer" value="none">None</SelectItem>
                  {assistants.map((assistant) => (
                    <SelectItem className="cursor-pointer" key={assistant.id} value={assistant.id}>
                      {assistant.name || "Un-named Assistant"} -{" "}
                      {assistant.model?.model || "Unkown model"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="vapiSettings.phoneNumber"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Numbers</FormLabel>
            <FormDescription>
              Phone numbers to display in the widget
            </FormDescription>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={phoneNumbersLoading || disabled}
              >
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue
                      placeholder={
                        phoneNumbersLoading
                          ? "Loading Phone Numbers"
                          : "Select a Phone Number"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-border">
                  <SelectItem className="cursor-pointer" value="none">None</SelectItem>
                  {phoneNumbers.map((phone) => (
                    <SelectItem className="cursor-pointer" key={phone.id} value={phone.number || phone.id}>
                      {phone.number || "Unkown Number"} -{" "}
                      {phone.name || "Unkown name"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
