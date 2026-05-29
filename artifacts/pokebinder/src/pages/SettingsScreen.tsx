import { useState, useRef } from "react";
import { Download, Upload, Trash2, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { clearAllData, importCollection, getFullCollection } from "@/storage/collectionStorage";

export default function SettingsScreen() {
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const data = getFullCollection();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pokebinder-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Collection exported successfully!" });
    } catch (err) {
      toast({ title: "Failed to export", variant: "destructive" });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.owned && !data.wanted) {
          throw new Error("Invalid format");
        }
        
        importCollection(data);
        toast({ title: "Collection imported successfully!" });
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        toast({ title: "Failed to parse JSON file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    clearAllData();
    toast({ title: "All data cleared." });
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Collection</CardTitle>
          <CardDescription>
            Download a backup of your entire collection (owned and wanted cards) as a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} className="w-full sm:w-auto font-bold btn-touch">
            <Download className="w-4 h-4 mr-2" /> Download as JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Collection</CardTitle>
          <CardDescription>
            Restore your collection from a backup JSON file. 
            <span className="text-destructive font-semibold ml-1">This will replace your current collection.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <Button onClick={triggerFileInput} variant="outline" className="w-full sm:w-auto font-bold btn-touch">
            <Upload className="w-4 h-4 mr-2" /> Upload JSON Backup
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete all owned and wanted cards from this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmClear ? (
            <Button 
              variant="destructive" 
              onClick={() => setConfirmClear(true)}
              className="w-full sm:w-auto font-bold btn-touch"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear Everything
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-white rounded-lg border border-destructive/20 shadow-sm">
              <p className="font-bold text-destructive">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleClear}
                  className="flex-1 font-bold btn-touch"
                >
                  Yes, clear everything
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 font-bold btn-touch"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}