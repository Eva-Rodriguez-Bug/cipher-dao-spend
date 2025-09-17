import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useDaoGovernance } from "@/hooks/useDaoGovernance";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";

interface CreateProposalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProposalModal = ({ isOpen, onOpenChange }: CreateProposalModalProps) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { createProposal, isCreatingProposal } = useDaoGovernance();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    beneficiary: "",
    duration: "7" // days
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: "Development", label: "Development" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
    { value: "Community", label: "Community" },
    { value: "Research", label: "Research" },
    { value: "Infrastructure", label: "Infrastructure" }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!formData.beneficiary.trim()) {
      newErrors.beneficiary = "Beneficiary address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.beneficiary)) {
      newErrors.beneficiary = "Invalid Ethereum address";
    }

    if (!formData.duration || isNaN(Number(formData.duration)) || Number(formData.duration) < 1) {
      newErrors.duration = "Duration must be at least 1 day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a proposal",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const proposal = await createProposal(
        formData.title,
        formData.description,
        formData.category,
        Number(formData.amount),
        formData.beneficiary,
        Number(formData.duration) * 24 * 60 * 60 // Convert days to seconds
      );

      if (proposal) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          amount: "",
          beneficiary: "",
          duration: "7"
        });
        setErrors({});
        onOpenChange(false);

        toast({
          title: "Proposal Created Successfully",
          description: `Proposal "${formData.title}" has been created and is now open for voting`,
        });
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast({
        title: "Proposal Creation Failed",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create New Proposal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter a clear, descriptive title for your proposal"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide a detailed description of what this proposal aims to achieve, including background, objectives, and expected outcomes"
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Category and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>
          </div>

          {/* Beneficiary */}
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary Address *</Label>
            <Input
              id="beneficiary"
              value={formData.beneficiary}
              onChange={(e) => handleInputChange("beneficiary", e.target.value)}
              placeholder="0x..."
              className={errors.beneficiary ? "border-red-500" : ""}
            />
            {errors.beneficiary && <p className="text-sm text-red-500">{errors.beneficiary}</p>}
            <p className="text-sm text-muted-foreground">
              The address that will receive the funds if the proposal is approved
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (Days) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              placeholder="7"
              min="1"
              max="30"
              className={errors.duration ? "border-red-500" : ""}
            />
            {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
            <p className="text-sm text-muted-foreground">
              How long the voting period should last (1-30 days)
            </p>
          </div>

          {/* Wallet Connection Status */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Wallet Status</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not connected"}
                </p>
              </div>
              {isConnected && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingProposal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || isCreatingProposal}
              className="bg-gradient-to-r from-cyber-green to-cyber-blue"
            >
              {isCreatingProposal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Proposal...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
