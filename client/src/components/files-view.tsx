import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FolderPlus, Search, Filter, FileText, Image, FileVideo, Archive, Download, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import type { File } from "@shared/schema";

export default function FilesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const { data: files = [], isLoading } = useQuery<File[]>({
    queryKey: ['/api/files'],
  });

  const queryClient = useQueryClient();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-8 w-8 text-yellow-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const folders = [...new Set(files.map(file => file.folder))];

  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === "" || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = folderFilter === "all" || file.folder === folderFilter;
    
    return matchesSearch && matchesFolder;
  });

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', folderFilter === 'all' ? 'Default' : folderFilter);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadMutation.mutate(uploadedFiles);
    }
    // Reset input
    event.target.value = '';
  }

  const handleDeleteFile = (fileId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Files Header */}
      <div className="bg-white border-b border-neutral-lighter px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-neutral-dark">Files</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredFiles.length} files
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-light" />
            </div>
            
            {/* Folder Filter */}
            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Actions */}
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button 
              className="bg-brand-primary text-white hover:bg-brand-secondary"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 flex items-center space-x-3">
            <span className="text-sm text-neutral-medium">
              {selectedFiles.length} files selected
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              selectedFiles.forEach(fileId => {
                window.open(`/api/files/${fileId}/download`, '_blank');
              });
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
                  selectedFiles.forEach(fileId => handleDeleteFile(fileId));
                  setSelectedFiles([]);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Files Content */}
      <div className="flex-1 bg-neutral-lightest p-6 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-neutral-light mx-auto mb-4" />
            <p className="text-neutral-medium text-lg mb-4">
              {searchQuery || folderFilter !== "all" ? "No files match your filters" : "No files yet"}
            </p>
            {uploadMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full"></div>
                <span>Uploading files...</span>
              </div>
            ) : (
              <Button 
                className="bg-brand-primary text-white hover:bg-brand-secondary"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First File
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <Card 
                key={file.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-brand-primary' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-center text-center w-full">
                      {getFileIcon(file.type)}
                      <CardTitle className="text-sm text-neutral-dark mt-2 line-clamp-2">
                        {file.originalName}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/api/files/${file.id}/download`, '_blank')}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Move to Folder</DropdownMenuItem>
                        <DropdownMenuItem>Add Tags</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-medium">
                      <span>Size</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-medium">
                      <span>Folder</span>
                      <span>{file.folder}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-medium">
                      <span>Modified</span>
                      <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {file.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
