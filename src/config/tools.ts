// Tool Configuration Types
export interface ToolConfig {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
}

// Registered Tools - Thêm tool mới vào đây
export const REGISTERED_TOOLS: ToolConfig[] = [
    {
        id: 'toolphoto2025',
        name: 'ToolPhoto 2025',
        icon: '📷',
        description: 'Quản lý ứng dụng xử lý ảnh AI',
        color: '#6366f1',
    },
    {
        id: 'decuongmate',
        name: 'DeCuong Mate',
        icon: '📚',
        description: 'Quản lý ứng dụng giải đề cương',
        color: '#8b5cf6',
    },
];

// Get tool by ID
export const getToolById = (id: string): ToolConfig | undefined => {
    return REGISTERED_TOOLS.find(tool => tool.id === id);
};
