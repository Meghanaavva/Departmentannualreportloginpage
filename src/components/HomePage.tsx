import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import { 
  LogOut,
  Search,
  Download,
  Upload,
  Plus,
  Filter,
  ArrowUpDown,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  Building,
  Award,
  TrendingUp,
  BarChart3,
  Target,
  Globe,
  Briefcase,
  Lightbulb,
  Trophy,
  User,
  Settings,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Save,
  X,
  FilterX,
  Home,
  Maximize2,
  Minimize2,
  RefreshCw,
  HelpCircle,
  Bell,
  Copy,
  Printer,
  FolderOpen,
  Mail,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import gitamLogo from 'figma:asset/962159bb4aae7f88a8c7a3bbc3b8fa9fa3bd0e9d.png';

interface HomePageProps {
  onLogout: () => void;
}

interface SectionData {
  id: number;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface FacultyRecord {
  designation: string;
  count: number;
  phd: number;
  experience: string;
}

interface StudentRecord {
  program: string;
  year: string;
  students: number;
  intake: number;
}

interface PlacementRecord {
  company: string;
  package: string;
  studentsPlaced: number;
  type: string;
  year?: string;
}

interface YearFilteredData {
  [year: string]: {
    faculty?: FacultyRecord[];
    students?: StudentRecord[];
    placements?: PlacementRecord[];
    [key: string]: any;
  };
}

interface ImportedFile {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  content?: string;
}

interface SectionTextData {
  [key: string]: string | number;
}

export function HomePage({ onLogout }: HomePageProps) {
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('cse');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [importedFiles, setImportedFiles] = useState<{[key: number]: ImportedFile[]}>({});
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ImportedFile | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [sectionYearFilters, setSectionYearFilters] = useState<{[key: number]: string}>({});
  
  // New state for editable row data
  const [editingRowData, setEditingRowData] = useState<any>(null);
  
  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{sectionId: number, index: number} | null>(null);
  
  // New state for selected row highlighting
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedRowSection, setSelectedRowSection] = useState<number | null>(null);
  
  // Track original data for change detection
  const [originalSectionData, setOriginalSectionData] = useState<{[year: string]: {[sectionId: number]: SectionTextData}}>({});
  
  // New state for section-specific text data (for sections 1-4, 8-19, 21-24)
  const [sectionData, setSectionData] = useState<{[year: string]: {[sectionId: number]: SectionTextData}}>({
    'master': {
      1: { schoolName: 'School of Technology', location: 'GITAM Deemed to be University' },
      2: { yearOfEstablishment: '1981', history: 'Established in 1981' },
      3: { hodName: 'Gondi Lakshmeeswari', email: 'hod_cse@gitam.edu', phone: '089128402870', qualification: 'PhD' }
    }, // Sections 1-4 data (constant across all years)
    '2024-25': {},
    '2023-24': {},
    '2025-26': {},
    '2026-27': {},
    '2027-28': {},
    '2028-29': {},
    '2029-30': {}
  });

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GITAM Teal color scheme
  const primaryColor = '#006D66';
  const accentColor = '#C69214';

  // Academic year options
  const academicYears = [
    '2023-24',
    '2024-25', 
    '2025-26',
    '2026-27',
    '2027-28',
    '2028-29',
    '2029-30'
  ];

  const sections: SectionData[] = [
    { id: 1, title: 'Name of the School', icon: Building, color: primaryColor, description: 'School information and details' },
    { id: 2, title: 'Year of Establishment', icon: Clock, color: accentColor, description: 'Establishment year and history' },
    { id: 3, title: 'Name of the HoD', icon: User, color: primaryColor, description: 'Head of Department information' },
    { id: 4, title: 'Programs Offered', icon: BookOpen, color: accentColor, description: 'UG, PG, and Ph.D programs' },
    { id: 5, title: 'Number of Faculty', icon: Users, color: primaryColor, description: 'Faculty strength by designation' },
    { id: 6, title: 'Number of Non-Teaching Staff', icon: Users, color: accentColor, description: 'Non-teaching staff details' },
    { id: 7, title: 'Program-wise Student Strength', icon: GraduationCap, color: primaryColor, description: 'Student enrollment by program' },
    { id: 8, title: 'Ph.D Degrees obtained by Faculty', icon: Award, color: accentColor, description: 'Faculty Ph.D achievements' },
    { id: 9, title: 'Research (Ph.D degree) Guidance by Faculty', icon: Lightbulb, color: primaryColor, description: 'Faculty research supervision' },
    { id: 10, title: 'Recharging Programs Organized by Various Departments', icon: Target, color: accentColor, description: 'Organized training programs' },
    { id: 11, title: 'Recharging Programs Attended by Faculty', icon: TrendingUp, color: primaryColor, description: 'Faculty attended programs' },
    { id: 12, title: 'Ongoing / Completed Funded Research Projects by Faculty', icon: Briefcase, color: accentColor, description: 'Research projects with funding' },
    { id: 13, title: 'Ongoing / Completed Consultancy Projects by Faculty', icon: Globe, color: primaryColor, description: 'Consultancy projects' },
    { id: 14, title: 'Research Profile of the Department', icon: BarChart3, color: accentColor, description: 'Publications and research output' },
    { id: 15, title: 'Books / Book Chapters / Monograph etc., Published', icon: BookOpen, color: primaryColor, description: 'Faculty publications' },
    { id: 16, title: 'Patents published by faculty', icon: Award, color: accentColor, description: 'Patent details and status' },
    { id: 17, title: 'MoUs / Collaborations', icon: Globe, color: primaryColor, description: 'Institutional collaborations' },
    { id: 18, title: 'Significant Achievements / Recognitions of Faculty', icon: Trophy, color: accentColor, description: 'Faculty awards and recognition' },
    { id: 19, title: 'Significant Achievements / Recognitions of Students', icon: Trophy, color: primaryColor, description: 'Student awards and achievements' },
    { id: 20, title: 'Placements', icon: Briefcase, color: accentColor, description: 'Placement statistics' },
    { id: 21, title: 'Outcomes (confirm label)', icon: Target, color: primaryColor, description: 'Higher studies and outcomes' },
    { id: 22, title: 'Result analysis', icon: BarChart3, color: accentColor, description: 'Semester-wise results' },
    { id: 23, title: 'Steps to improve Academic Performance of Students', icon: TrendingUp, color: primaryColor, description: 'Student improvement strategies' },
    { id: 24, title: 'Steps to improve Faculty Engagement / Research Projects / External Funding', icon: Users, color: accentColor, description: 'Faculty development initiatives' }
  ];

  // State for all data sections with year-wise data
  const [allYearData, setAllYearData] = useState<YearFilteredData>({
    '2024-25': {
      faculty: [],
      students: [],
      placements: []
    },
    '2023-24': {
      faculty: [],
      students: [],
      placements: []
    },
    '2025-26': {
      faculty: [],
      students: [],
      placements: []
    },
    '2026-27': {
      faculty: [],
      students: [],
      placements: []
    },
    '2027-28': {
      faculty: [],
      students: [],
      placements: []
    },
    '2028-29': {
      faculty: [],
      students: [],
      placements: []
    },
    '2029-30': {
      faculty: [],
      students: [],
      placements: []
    }
  });

  // Computed states for current data based on selected year
  const [facultyData, setFacultyData] = useState<FacultyRecord[]>(
    allYearData[selectedYear]?.faculty || []
  );

  const [studentData, setStudentData] = useState<StudentRecord[]>(
    allYearData[selectedYear]?.students || []
  );

  const [placementData, setPlacementData] = useState<PlacementRecord[]>(
    allYearData[selectedYear]?.placements || []
  );

  // Filter sections based on search term
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update data when year changes - no circular dependency
  useEffect(() => {
    const yearData = allYearData[selectedYear];
    if (yearData) {
      setFacultyData(yearData.faculty || []);
      setStudentData(yearData.students || []);
      setPlacementData(yearData.placements || []);
      
      // Show notification when year changes
      const facultyCount = yearData.faculty?.reduce((sum, f) => sum + f.count, 0) || 0;
      const studentCount = yearData.students?.reduce((sum, s) => sum + s.students, 0) || 0;
      const placementCount = yearData.placements?.reduce((sum, p) => sum + p.studentsPlaced, 0) || 0;
      
      toast.success(`Data updated for Academic Year ${selectedYear}`, {
        description: `Faculty: ${facultyCount}, Students: ${studentCount}, Placements: ${placementCount}`
      });
    }
  }, [selectedYear, allYearData]);

  // Handle year change for specific section - now updates global year
  const handleSectionYearChange = useCallback((sectionId: number, year: string) => {
    // Update global year instead of section-specific year
    setSelectedYear(year);
    toast.success(`Global year filter updated to ${year} - all sections now show ${year} data`);
  }, []);

  // Get current year for section - now always uses global year for consistency
  const getCurrentSectionYear = useCallback((sectionId: number) => {
    // Always use global selected year to ensure all sections show same year data
    return selectedYear;
  }, [selectedYear]);

  // Get data for specific section and year
  const getSectionData = useCallback((sectionId: number, dataType: 'faculty' | 'students' | 'placements') => {
    // Always use the global selected year for consistency
    const year = selectedYear;
    const yearData = allYearData[year];
    
    if (!yearData) return [];
    
    switch (dataType) {
      case 'faculty':
        return yearData.faculty || [];
      case 'students':
        return yearData.students || [];
      case 'placements':
        return yearData.placements || [];
      default:
        return [];
    }
  }, [allYearData, selectedYear]);

  // CSV Converter Function
  const convertToCSV = useCallback((data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }, []);

  // Generate PDF content for individual sections
  const generateSectionPDFContent = useCallback((sectionTitle: string, data: any[], year: string) => {
    let content = `${sectionTitle.toUpperCase()} - ACADEMIC YEAR ${year}\n`;
    content += `${'='.repeat(60)}\n\n`;
    
    if (data && data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      content += headers.join('\t') + '\n';
      content += '-'.repeat(60) + '\n';
      
      // Add data rows
      data.forEach((row, index) => {
        const values = headers.map(header => row[header] || '');
        content += `${index + 1}.\t${values.join('\t')}\n`;
      });
      
      content += `\nTotal Records: ${data.length}\n`;
    } else {
      content += 'No data available for this section.\n';
    }
    
    content += `\nGenerated on: ${new Date().toLocaleString()}\n`;
    content += `Academic Year: ${year}\n`;
    
    return content;
  }, []);

  // Advanced PDF Generation using jsPDF
  const generateAdvancedPDF = useCallback((content: string, filename: string) => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Set colors (GITAM brand colors)
      const primaryColor = [0, 109, 102]; // #006D66
      const accentColor = [198, 146, 20]; // #C69214
      const textColor = [51, 51, 51]; // #333333
      
      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // University Logo/Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('GITAM DEEMED TO BE UNIVERSITY', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Department of Computer Science and Engineering', pageWidth / 2, 25, { align: 'center' });
      doc.text('Annual Report System', pageWidth / 2, 32, { align: 'center' });
      
      // Main content area
      let yPosition = 55;
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Process content line by line
      const lines = content.split('\n');
      const lineHeight = 5;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Handle different formatting based on content
        if (line.includes('='.repeat(50)) || line.includes('-'.repeat(50))) {
          // Separator lines
          doc.setDrawColor(...primaryColor);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += lineHeight;
          continue;
        }
        
        if (line.toUpperCase() === line && line.trim().length > 0 && !line.includes(':')) {
          // Section headers (all caps)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...primaryColor);
        } else if (line.includes(':') && line.trim().length < 50) {
          // Sub-headers with colons
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...accentColor);
        } else {
          // Regular content
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...textColor);
        }
        
        // Split long lines
        const wrappedLines = doc.splitTextToSize(line, contentWidth);
        
        for (const wrappedLine of wrappedLines) {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight;
        }
      }
      
      // Footer on every page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer background
        doc.setFillColor(245, 245, 245);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        // Footer text
        doc.setTextColor(102, 102, 102);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 15);
        doc.text('GITAM Deemed to be University - Department of Computer Science and Engineering', margin, pageHeight - 10);
        doc.text('For queries, contact: hod.cse@gitam.edu | +91-891-2840-2870', margin, pageHeight - 5);
        
        // Page number
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      // Save the PDF
      doc.save(filename);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to browser print method
      generateSimplePDF(content, filename);
    }
  }, []);

  // Simple PDF Generation (Browser Print Method)
  const generateSimplePDF = useCallback((content: string, filename: string) => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback to regular download if popup blocked
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename.replace('.pdf', '.txt');
      link.click();
      return;
    }

    // Create formatted HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 1in;
            }
            
            @media print {
              body { 
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
                background: white;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #006D66;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                color: #006D66;
                margin-bottom: 10px;
              }
              .subtitle {
                font-size: 16px;
                color: #333;
                margin-bottom: 5px;
              }
              .content {
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                line-height: 1.3;
              }
              .footer {
                position: fixed;
                bottom: 20px;
                width: 100%;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #ccc;
                padding-top: 10px;
              }
              .page-break {
                page-break-before: always;
              }
            }
            
            body { 
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: white;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #006D66;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #006D66;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #333;
              margin-bottom: 5px;
            }
            .content {
              white-space: pre-wrap;
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">GITAM DEEMED TO BE UNIVERSITY</div>
            <div class="subtitle">Department of Computer Science and Engineering</div>
            <div class="subtitle">Annual Report System</div>
          </div>
          
          <div class="content">${content.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')}</div>
          
          <div class="footer">
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>GITAM Deemed to be University - Department of Computer Science and Engineering</div>
            <div>For queries, contact: hod.cse@gitam.edu | +91-891-2840-2870</div>
          </div>
        </body>
      </html>
    `;

    // Write content to new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }, []);

  // Main PDF Generation Function (tries advanced first, falls back to simple)
  const generatePDF = useCallback((content: string, filename: string) => {
    try {
      // Try advanced PDF generation first
      generateAdvancedPDF(content, filename);
    } catch {
      // Fallback to simple PDF generation
      generateSimplePDF(content, filename);
    }
  }, [generateAdvancedPDF, generateSimplePDF]);

  // Excel/PDF Export Functions
  const handleExportExcel = useCallback((sectionId: number) => {
    const currentYear = getCurrentSectionYear(sectionId);
    let data: any[] = [];
    let filename = '';
    let sectionTitle = '';

    if (sectionId === 5) {
      data = getSectionData(sectionId, 'faculty');
      filename = `Faculty_Data_${currentYear}`;
      sectionTitle = 'Faculty Data';
    } else if (sectionId === 7) {
      data = getSectionData(sectionId, 'students');
      filename = `Student_Data_${currentYear}`;
      sectionTitle = 'Student Data';
    } else if (sectionId === 20) {
      data = getSectionData(sectionId, 'placements');
      filename = `Placement_Data_${currentYear}`;
      sectionTitle = 'Placement Data';
    }

    // Generate both CSV and PDF
    
    // CSV Export
    const csvContent = convertToCSV(data);
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvLink = document.createElement('a');
    csvLink.href = URL.createObjectURL(csvBlob);
    csvLink.download = `${filename}.csv`;
    csvLink.click();

    // PDF Export
    const pdfContent = generateSectionPDFContent(sectionTitle, data, currentYear);
    setTimeout(() => {
      generatePDF(pdfContent, `${filename}.pdf`);
    }, 500);
    
    toast.success(`${sectionTitle} exported as CSV and PDF successfully!`);
  }, [getCurrentSectionYear, getSectionData, convertToCSV, generatePDF, generateSectionPDFContent]);

  // Master Export Function - Download ALL Data as PDF
  const handleDownloadAllData = useCallback(() => {
    toast.info('Preparing comprehensive data export...');
    
    // Create comprehensive data export with all sections and years
    let masterContent = '';
    
    // Header
    masterContent += `GITAM Deemed to be University - Annual Report System\n`;
    masterContent += `Complete Data Export - All Sections & Academic Years\n`;
    masterContent += `Generated on: ${new Date().toLocaleString()}\n`;
    masterContent += `Department: Computer Science and Engineering\n\n`;
    masterContent += `${'='.repeat(80)}\n\n`;

    // Summary
    const totalSections = sections.length;
    const sectionsWithData = [5, 7, 20]; // Sections that have data
    const totalYears = academicYears.length;
    
    masterContent += `EXECUTIVE SUMMARY:\n`;
    masterContent += `- Total Report Sections: ${totalSections}\n`;
    masterContent += `- Sections with Data: ${sectionsWithData.length}\n`;
    masterContent += `- Academic Years Covered: ${totalYears} (${academicYears[0]} to ${academicYears[academicYears.length - 1]})\n`;
    masterContent += `- Data Export Date: ${new Date().toLocaleDateString()}\n\n`;
    masterContent += `${'='.repeat(80)}\n\n`;

    // Export all sections data for all years
    academicYears.forEach(year => {
      masterContent += `ACADEMIC YEAR: ${year}\n`;
      masterContent += `${'-'.repeat(50)}\n\n`;

      // Section 5: Faculty Data
      const facultyDataForYear = allYearData[year]?.faculty || [];
      if (facultyDataForYear.length > 0) {
        masterContent += `Section 5: Number of Faculty\n`;
        masterContent += `${'-'.repeat(30)}\n`;
        facultyDataForYear.forEach(faculty => {
          masterContent += `• ${faculty.designation}: ${faculty.count} faculty (${faculty.phd} with Ph.D.)\n`;
          masterContent += `  Experience: ${faculty.experience}\n`;
        });
        masterContent += `\nTotal Faculty: ${facultyDataForYear.reduce((sum, f) => sum + f.count, 0)}\n`;
        masterContent += `Total with PhD: ${facultyDataForYear.reduce((sum, f) => sum + f.phd, 0)}\n\n`;
      } else {
        masterContent += `Section 5: Number of Faculty - No data available\n\n`;
      }

      // Section 7: Student Data
      const studentDataForYear = allYearData[year]?.students || [];
      if (studentDataForYear.length > 0) {
        masterContent += `Section 7: Program-wise Student Strength\n`;
        masterContent += `${'-'.repeat(30)}\n`;
        studentDataForYear.forEach(student => {
          const occupancy = Math.round((student.students / student.intake) * 100);
          masterContent += `• ${student.program} ${student.year}: ${student.students}/${student.intake} students (${occupancy}%)\n`;
        });
        masterContent += `\nTotal Students: ${studentDataForYear.reduce((sum, s) => sum + s.students, 0)}\n`;
        masterContent += `Total Intake: ${studentDataForYear.reduce((sum, s) => sum + s.intake, 0)}\n\n`;
      } else {
        masterContent += `Section 7: Program-wise Student Strength - No data available\n\n`;
      }

      // Section 20: Placement Data
      const placementDataForYear = allYearData[year]?.placements || [];
      if (placementDataForYear.length > 0) {
        masterContent += `Section 20: Placements\n`;
        masterContent += `${'-'.repeat(30)}\n`;
        placementDataForYear.forEach(placement => {
          masterContent += `• ${placement.company}: ${placement.studentsPlaced} students @ ${placement.package} (${placement.type})\n`;
        });
        masterContent += `\nTotal Students Placed: ${placementDataForYear.reduce((sum, p) => sum + p.studentsPlaced, 0)}\n`;
        const packages = placementDataForYear.map(p => parseInt(p.package.replace(' LPA', '')) || 0);
        if (packages.length > 0) {
          masterContent += `Highest Package: ${Math.max(...packages)} LPA\n`;
          masterContent += `Average Package: ${(packages.reduce((sum, p) => sum + p, 0) / packages.length).toFixed(2)} LPA\n\n`;
        }
      } else {
        masterContent += `Section 20: Placements - No data available\n\n`;
      }

      masterContent += `${'-'.repeat(50)}\n\n`;
    });

    // All Sections List
    masterContent += `COMPLETE SECTIONS LIST:\n`;
    masterContent += `${'-'.repeat(50)}\n`;
    sections.forEach(section => {
      const hasData = [5, 7, 20].includes(section.id) ? ' ✓ HAS DATA' : ' (Template Ready)';
      masterContent += `${section.id.toString().padStart(2, '0')}. ${section.title}${hasData}\n`;
    });

    masterContent += `\n${'='.repeat(80)}\n`;
    masterContent += `End of Report - Generated by GITAM Annual Report System\n`;
    masterContent += `For support, contact: support@gitam.edu\n`;

    // Generate PDF
    generatePDF(masterContent, `GITAM_Complete_Annual_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setTimeout(() => {
      toast.success('Complete data export prepared for PDF download!');
    }, 1000);
    
  }, [academicYears, allYearData, sections, generatePDF]);

  // Check if a section has data filled for the selected year
  const hasSectionData = useCallback((sectionId: number) => {
    // For sections 1-3, check master data (same for all years)
    if (sectionId >= 1 && sectionId <= 3) {
      const masterData = sectionData['master']?.[sectionId];
      if (!masterData) return false;
      // Check if there's any non-empty value in the master data
      return Object.values(masterData).some(value => 
        value !== null && value !== undefined && value !== ''
      );
    }
    
    // For section 4 (Programs Offered), only show green dot for 2023-24 and 2024-25
    if (sectionId === 4) {
      return selectedYear === '2024-25' || selectedYear === '2023-24';
    }
    
    // For sections with table data (5, 6, 7, 20)
    if (sectionId === 5) {
      const data = allYearData[selectedYear]?.faculty || [];
      return data.length > 0;
    }
    if (sectionId === 6) {
      // Non-teaching staff - check if data exists for this year
      const data = sectionData[selectedYear]?.[6];
      if (!data) return false;
      return Object.values(data).some(value => 
        value !== null && value !== undefined && value !== ''
      );
    }
    if (sectionId === 7) {
      const data = allYearData[selectedYear]?.students || [];
      return data.length > 0;
    }
    if (sectionId === 20) {
      const data = allYearData[selectedYear]?.placements || [];
      return data.length > 0;
    }
    
    // For sections 8-19, 21-24, check if sectionData has any values for the selected year
    const yearData = sectionData[selectedYear]?.[sectionId];
    if (!yearData) return false;
    
    // Check if there's any non-empty value
    return Object.values(yearData).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }, [sectionData, allYearData, selectedYear]);

  // Download Report Function - Year-specific Annual Report as PDF
  // FIXED: Download Report with proper formatting and only actual entered data
  const handleDownloadReport = useCallback(() => {
    // Validation: Check if year is selected
    if (!selectedYear) {
      toast.error('Please select a year before downloading.');
      return;
    }

    // Show download progress toast
    toast.info(`Annual Report ${selectedYear} is downloading...`);

    // Get data for the selected year
    const yearData = allYearData[selectedYear];
    
    // Create comprehensive annual report document content
    let reportContent = '';
    
    // Document Header
    reportContent += `GITAM DEEMED TO BE UNIVERSITY\n`;
    reportContent += `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\n`;
    reportContent += `ANNUAL REPORT ${selectedYear}\n\n`;
    reportContent += `${'='.repeat(80)}\n\n`;
    
    // Executive Summary
    reportContent += `EXECUTIVE SUMMARY\n`;
    reportContent += `${'-'.repeat(80)}\n\n`;
    reportContent += `Academic Year: ${selectedYear}\n`;
    reportContent += `Department: Computer Science and Engineering\n`;
    reportContent += `Report Generated: ${new Date().toLocaleDateString()}\n`;
    reportContent += `Total Report Sections: ${sections.length}\n\n`;
    
    // Faculty Summary
    const facultyData = yearData?.faculty || [];
    if (facultyData.length > 0) {
      const totalFaculty = facultyData.reduce((sum, f) => sum + f.count, 0);
      const totalPhd = facultyData.reduce((sum, f) => sum + f.phd, 0);
      reportContent += `Faculty Strength: ${totalFaculty} members\n`;
      reportContent += `Faculty with Ph.D.: ${totalPhd} (${totalFaculty > 0 ? Math.round((totalPhd/totalFaculty)*100) : 0}%)\n`;
    }
    
    // Student Summary
    const studentData = yearData?.students || [];
    if (studentData.length > 0) {
      const totalStudents = studentData.reduce((sum, s) => sum + s.students, 0);
      const totalIntake = studentData.reduce((sum, s) => sum + s.intake, 0);
      reportContent += `Student Strength: ${totalStudents} students\n`;
      reportContent += `Intake Capacity: ${totalIntake} seats\n`;
      reportContent += `Occupancy Rate: ${totalIntake > 0 ? Math.round((totalStudents/totalIntake)*100) : 0}%\n`;
    }
    
    // Placement Summary
    const placementData = yearData?.placements || [];
    if (placementData.length > 0) {
      const totalPlaced = placementData.reduce((sum, p) => sum + p.studentsPlaced, 0);
      const packages = placementData.map(p => parseInt(p.package.replace(' LPA', '')) || 0);
      const avgPackage = packages.length > 0 ? (packages.reduce((sum, p) => sum + p, 0) / packages.length).toFixed(2) : 0;
      const maxPackage = packages.length > 0 ? Math.max(...packages) : 0;
      reportContent += `Students Placed: ${totalPlaced}\n`;
      reportContent += `Average Package: ${avgPackage} LPA\n`;
      reportContent += `Highest Package: ${maxPackage} LPA\n`;
    }
    
    reportContent += `\n${'='.repeat(80)}\n\n`;
    
    // Detailed Sections - Filter to only include sections with data for the selected year
    const sectionsWithData = sections.filter(section => {
      // Use the same logic as hasSectionData to ensure consistency
      return hasSectionData(section.id);
    });
    
    reportContent += `Sections with Data: ${sectionsWithData.length}\n\n`;
    
    sectionsWithData.forEach((section, index) => {
      // Section header with proper numbering
      reportContent += `${(index + 1).toString().padStart(2, '0')}. ${section.title.toUpperCase()}\n`;
      reportContent += `${'-'.repeat(80)}\n\n`;
      
      // Add section-specific data if available
      if (section.id === 1 && sectionData['master']?.[1]?.schoolName) {
        const schoolName = sectionData['master'][1].schoolName;
        reportContent += `School Name: ${schoolName}\n\n`;
      } else if (section.id === 2 && sectionData['master']?.[2]?.year) {
        const yearEst = sectionData['master'][2].year;
        reportContent += `Year of Establishment: ${yearEst}\n\n`;
      } else if (section.id === 3 && sectionData['master']?.[3]) {
        const hodData = sectionData['master'][3];
        reportContent += `Head of Department Details:\n\n`;
        if (hodData.hodName) reportContent += `  Name:          ${hodData.hodName}\n`;
        if (hodData.email) reportContent += `  Email:         ${hodData.email}\n`;
        if (hodData.phone) reportContent += `  Phone:         ${hodData.phone}\n`;
        if (hodData.qualification) reportContent += `  Qualification: ${hodData.qualification}\n`;
        reportContent += `\n`;
      } else if (section.id === 4) {
        const curriculumYear = selectedYear === '2023-24' ? '2023' : '2024';
        reportContent += `Programs Offered (Curriculum Revision: ${curriculumYear}):\n\n`;
        reportContent += `UNDERGRADUATE PROGRAMS:\n`;
        reportContent += `  1. B.Tech. Computer Science and Engineering (AI & ML) - 4 Years\n`;
        reportContent += `  2. B.Tech. Computer Science and Engineering (Cyber Security) - 4 Years\n`;
        reportContent += `  3. B.Tech. Computer Science and Engineering (Data Science) - 4 Years\n`;
        reportContent += `  4. B.Tech. Biomedical Engineering - 4 Years\n`;
        reportContent += `  5. B.Tech. Biotechnology - 4 Years\n`;
        reportContent += `  6. B.Tech. Civil Engineering with Computer Application - 4 Years\n`;
        reportContent += `  7. B.Tech. Computer Science and Engineering - 4 Years\n`;
        reportContent += `  8. B.Tech. Electrical and Computer Engineering - 4 Years\n`;
        reportContent += `  9. B.Tech. Electronics and Communications Engineering - 4 Years\n`;
        reportContent += `  10. B.Tech. Electronics and Engineering (VLSI Design and Technology) - 4 Years\n`;
        reportContent += `  11. B.Tech. Mechanical Engineering - 4 Years\n`;
        reportContent += `  12. B.Tech. Robotics & Artificial Intelligence - 4 Years\n\n`;
        reportContent += `POSTGRADUATE PROGRAMS:\n`;
        reportContent += `  1. M.Tech. Data Science - 2 Years\n`;
        reportContent += `  2. M.Tech. Food Processing Technology - 2 Years\n`;
        reportContent += `  3. M.Tech. Structural Engineering - 2 Years\n`;
        reportContent += `  4. M.Tech. Construction Technology and Management - 2 Years\n`;
        reportContent += `  5. M.Tech. Computer Science and Engineering - 2 Years\n`;
        reportContent += `  6. M.Tech. VLSI Design - 2 Years\n`;
        reportContent += `  7. M.Tech. Power System and Automation - 2 Years\n`;
        reportContent += `  8. M.Tech. Machine Design and Robotics - 2 Years\n`;
        reportContent += `  9. M.Tech. Manufacturing Technology and Automation - 2 Years\n`;
        reportContent += `  10. M.Tech. Geotechnical Engineering - 2 Years\n\n`;
        reportContent += `Ph.D. PROGRAMS:\n`;
        reportContent += `  1. Ph.D. in Biotechnology - 3–5 Years\n`;
        reportContent += `  2. Ph.D. in Civil Engineering - 3–5 Years\n`;
        reportContent += `  3. Ph.D. in Computer Science & Engineering - 3–5 Years\n`;
        reportContent += `  4. Ph.D. in Electronics & Communication Engineering - 3–5 Years\n`;
        reportContent += `  5. Ph.D. in Electrical & Electronics Engineering - 3–5 Years\n`;
        reportContent += `  6. Ph.D. in Mechanical Engineering - 3–5 Years\n\n`;
      } else if (section.id === 5 && facultyData.length > 0) {
        reportContent += `Faculty Details:\n\n`;
        facultyData.forEach((faculty, idx) => {
          reportContent += `  ${idx + 1}. ${faculty.designation}: ${faculty.count} faculty members (${faculty.phd} with Ph.D.)\n`;
          reportContent += `     Experience: ${faculty.experience}\n\n`;
        });
      } else if (section.id === 7 && studentData.length > 0) {
        reportContent += `Student Enrollment:\n\n`;
        studentData.forEach((student, idx) => {
          const occupancy = Math.round((student.students / student.intake) * 100);
          reportContent += `  ${idx + 1}. ${student.program} ${student.year}: ${student.students}/${student.intake} students (${occupancy}% occupancy)\n\n`;
        });
      } else if (section.id === 20 && placementData.length > 0) {
        reportContent += `Placement Statistics:\n\n`;
        placementData.forEach((placement, idx) => {
          reportContent += `  ${idx + 1}. ${placement.company}: ${placement.studentsPlaced} students placed @ ${placement.package}\n`;
          reportContent += `     Type: ${placement.type}\n\n`;
        });
      } else {
        reportContent += `  [Data to be filled]\n\n`;
      }
      
      // Add separator line after each section
      reportContent += `${'-'.repeat(80)}\n\n`;
    });
    
    // Footer
    reportContent += `${'='.repeat(80)}\n\n`;
    reportContent += `This report was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    reportContent += `GITAM Deemed to be University - Department of Computer Science and Engineering\n`;
    reportContent += `For queries, contact: hod_cse@gitam.edu | +91-891-2840-2870\n`;
    
    // Generate PDF
    generatePDF(reportContent, `Annual_Report_${selectedYear}.pdf`);
    
    // Success feedback
    setTimeout(() => {
      toast.success(`Annual Report ${selectedYear} prepared for PDF download!`);
    }, 1000);
    
  }, [selectedYear, allYearData, sections, generatePDF, sectionData, hasSectionData]);

  // All Button Functions
  const handleHome = useCallback(() => {
    setSelectedSection(null);
    setIsModalOpen(false);
    setSearchTerm('');
    setFilterText('');
    setSortConfig(null);
    toast.success('Returned to home dashboard');
  }, []);

  const handleRefreshData = useCallback(() => {
    toast.success('Data refreshed successfully!');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
    toast.success('Print dialog opened');
  }, []);



  const handleCopyData = useCallback(() => {
    let copyText = '';
    if (selectedSection) {
      copyText = `GITAM Annual Report - ${selectedSection.title}\n`;
      if (selectedSection.id === 5) {
        copyText += facultyData.map((item, index) => 
          `${index + 1}. ${item.designation}: ${item.count} faculty (${item.phd} with Ph.D)`
        ).join('\n');
      } else if (selectedSection.id === 7) {
        copyText += studentData.map((item, index) => 
          `${index + 1}. ${item.program} ${item.year}: ${item.students}/${item.intake} students`
        ).join('\n');
      } else if (selectedSection.id === 20) {
        copyText += placementData.map((item, index) => 
          `${index + 1}. ${item.company}: ${item.studentsPlaced} students @ ${item.package}`
        ).join('\n');
      }
    }
    
    // Fallback method that works without Clipboard API permissions
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(() => {
          toast.success('Data copied to clipboard!');
        }).catch(() => {
          // Fallback to textarea method
          copyWithTextarea(copyText);
        });
      } else {
        // Use textarea fallback directly
        copyWithTextarea(copyText);
      }
    } catch (error) {
      // Final fallback
      copyWithTextarea(copyText);
    }
    
    function copyWithTextarea(text: string) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success('Data copied to clipboard!');
        } else {
          toast.error('Failed to copy data. Please try again.');
        }
      } catch (err) {
        toast.error('Copy not supported in this browser.');
      }
      
      document.body.removeChild(textarea);
    }
  }, [selectedSection, facultyData, studentData, placementData]);



  const handleNotifications = useCallback(() => {
    setShowNotifications(true);
  }, []);

  const handleHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const handleViewImportedFiles = useCallback((sectionId: number) => {
    const files = importedFiles[sectionId] || [];
    if (files.length === 0) {
      toast.info('No imported files for this section');
      return;
    }
    
    if (files.length === 1) {
      setSelectedFile(files[0]);
      setShowFileViewer(true);
    } else {
      toast.info(`${files.length} files imported. Click on a specific file to view.`);
    }
  }, [importedFiles]);

  // CSV Parser Helper Function
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
      });
      rows.push(row);
    }
    
    return rows;
  };

  // JSON Parser Helper Function
  const parseJSON = (text: string): any[] => {
    try {
      const parsed = JSON.parse(text);
      // Handle both array and single object
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        return [parsed];
      }
      return [];
    } catch (error) {
      console.error('JSON parsing error:', error);
      return [];
    }
  };

  // Text Document Parser - extracts key-value pairs from text
  const parseTextDocument = (text: string): any => {
    const data: any = {};
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Try to match key-value pairs with various separators
      const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
      const equalsMatch = line.match(/^([^=]+)=\s*(.+)$/);
      const dashMatch = line.match(/^-\s*([^:]+):\s*(.+)$/);
      
      if (colonMatch) {
        const key = colonMatch[1].trim().toLowerCase().replace(/\s+/g, '');
        const value = colonMatch[2].trim();
        data[key] = value;
      } else if (equalsMatch) {
        const key = equalsMatch[1].trim().toLowerCase().replace(/\s+/g, '');
        const value = equalsMatch[2].trim();
        data[key] = value;
      } else if (dashMatch) {
        const key = dashMatch[1].trim().toLowerCase().replace(/\s+/g, '');
        const value = dashMatch[2].trim();
        data[key] = value;
      }
    }
    
    return Object.keys(data).length > 0 ? [data] : [];
  };

  // Smart field matcher - matches imported fields to expected fields
  const matchField = (importedKey: string, possibleMatches: string[]): string | null => {
    const normalizedKey = importedKey.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');
    
    for (const match of possibleMatches) {
      const normalizedMatch = match.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');
      if (normalizedKey === normalizedMatch || normalizedKey.includes(normalizedMatch) || normalizedMatch.includes(normalizedKey)) {
        return match;
      }
    }
    
    return null;
  };

  // Import Document Functions (Supports CSV, JSON, TXT, DOC, Excel)
  const handleImportDocument = useCallback((sectionId: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-section-id', sectionId.toString());
      fileInputRef.current.click();
    }
  }, []);
  
  // Keep old name for backwards compatibility
  const handleImportExcel = handleImportDocument;

  const processExcelFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const sectionId = parseInt(event.target.getAttribute('data-section-id') || '0');
    
    if (!file) return;

    const fileInfo: ImportedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        fileInfo.content = text;
        
        setImportedFiles(prev => ({
          ...prev,
          [sectionId]: [...(prev[sectionId] || []), fileInfo]
        }));

        // Determine file format and parse accordingly
        let parsedData: any[] = [];
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.json')) {
          parsedData = parseJSON(text);
          toast.info('Parsing JSON file...');
        } else if (fileName.endsWith('.csv')) {
          parsedData = parseCSV(text);
          toast.info('Parsing CSV file...');
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
          parsedData = parseTextDocument(text);
          toast.info('Parsing text document...');
        } else {
          // Try to auto-detect format
          try {
            parsedData = parseJSON(text);
            toast.info('Auto-detected JSON format');
          } catch {
            const csvData = parseCSV(text);
            if (csvData.length > 0) {
              parsedData = csvData;
              toast.info('Auto-detected CSV format');
            } else {
              parsedData = parseTextDocument(text);
              toast.info('Parsing as text document');
            }
          }
        }

        if (parsedData.length === 0) {
          toast.error('No data found in file. Please check the format.');
          return;
        }

        const currentYear = selectedYear;
        
        // Section 5: Faculty Data
        if (sectionId === 5) {
          const importedData: FacultyRecord[] = parsedData.map(row => {
            // Smart field matching for faculty data
            const getField = (possibleKeys: string[]) => {
              for (const key of possibleKeys) {
                const matched = matchField(key, Object.keys(row));
                if (matched && row[matched]) return row[matched];
              }
              return '';
            };
            
            return {
              designation: getField(['designation', 'title', 'position', 'rank']) || row.designation || row.Designation || '',
              count: parseInt(getField(['count', 'number', 'total', 'faculty']) || row.count || row.Count || row.number || '0'),
              phd: parseInt(getField(['phd', 'doctorate', 'phdcount', 'withphd']) || row.phd || row.PhD || row.phdcount || '0'),
              experience: getField(['experience', 'exp', 'years', 'yearsofexperience']) || row.experience || row.Experience || ''
            };
          });
          
          setAllYearData(prev => ({
            ...prev,
            [currentYear]: {
              ...prev[currentYear],
              faculty: importedData
            }
          }));
          setFacultyData(importedData);
          toast.success(`${importedData.length} faculty record(s) imported and auto-filled from ${file.name}!`);
        } 
        // Section 7: Student Data
        else if (sectionId === 7) {
          const importedData: StudentRecord[] = parsedData.map(row => {
            // Smart field matching for student data
            const getField = (possibleKeys: string[]) => {
              for (const key of possibleKeys) {
                const matched = matchField(key, Object.keys(row));
                if (matched && row[matched]) return row[matched];
              }
              return '';
            };
            
            return {
              program: getField(['program', 'course', 'degree', 'programname']) || row.program || row.Program || row.programname || '',
              year: getField(['year', 'academicyear', 'level', 'class']) || row.year || row.Year || row.academicyear || '',
              students: parseInt(getField(['students', 'enrolled', 'numberofstudents', 'strength']) || row.students || row.Students || row.numberofstudents || '0'),
              intake: parseInt(getField(['intake', 'capacity', 'intakecapacity', 'seats']) || row.intake || row.Intake || row.intakecapacity || '0')
            };
          });
          
          setAllYearData(prev => ({
            ...prev,
            [currentYear]: {
              ...prev[currentYear],
              students: importedData
            }
          }));
          setStudentData(importedData);
          toast.success(`${importedData.length} student record(s) imported and auto-filled from ${file.name}!`);
        } 
        // Section 20: Placement Data
        else if (sectionId === 20) {
          const importedData: PlacementRecord[] = parsedData.map(row => {
            // Smart field matching for placement data
            const getField = (possibleKeys: string[]) => {
              for (const key of possibleKeys) {
                const matched = matchField(key, Object.keys(row));
                if (matched && row[matched]) return row[matched];
              }
              return '';
            };
            
            return {
              company: getField(['company', 'organization', 'companyname', 'employer']) || row.company || row.Company || row.companyname || '',
              package: getField(['package', 'salary', 'ctc', 'compensation']) || row.package || row.Package || row.salary || '',
              studentsPlaced: parseInt(getField(['studentsplaced', 'placed', 'hired', 'count']) || row.studentsplaced || row.StudentsPlaced || row.placed || '0'),
              type: getField(['type', 'placementtype', 'category', 'mode']) || row.type || row.Type || row.placementtype || 'On-Campus'
            };
          });
          
          setAllYearData(prev => ({
            ...prev,
            [currentYear]: {
              ...prev[currentYear],
              placements: importedData
            }
          }));
          setPlacementData(importedData);
          toast.success(`${importedData.length} placement record(s) imported and auto-filled from ${file.name}!`);
        }
        // Sections 1-4: Fixed data (stored in master)
        else if (sectionId >= 1 && sectionId <= 4) {
          // Merge all rows if multiple records, or use first row
          const mergedData: any = {};
          parsedData.forEach(row => {
            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');
              if (!mergedData[normalizedKey] || !mergedData[normalizedKey].trim()) {
                mergedData[normalizedKey] = row[key];
              }
            });
          });
          
          const importedTextData: SectionTextData = {};
          
          // Section-specific field mapping
          if (sectionId === 1) {
            // School information
            const possibleSchoolKeys = ['schoolname', 'school', 'name', 'institution'];
            const possibleLocationKeys = ['location', 'address', 'place', 'campus'];
            const possibleDeptKeys = ['department', 'dept', 'departmentname'];
            
            importedTextData.schoolName = mergedData[matchField('schoolname', Object.keys(mergedData))?.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '')] || 
                                          mergedData.schoolname || mergedData.school || mergedData.name || '';
            importedTextData.location = mergedData[matchField('location', Object.keys(mergedData))?.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '')] || 
                                        mergedData.location || mergedData.address || '';
            importedTextData.department = mergedData[matchField('department', Object.keys(mergedData))?.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '')] || 
                                          mergedData.department || mergedData.dept || '';
          } else if (sectionId === 2) {
            // Year of establishment
            importedTextData.year = mergedData.year || mergedData.yearofestablishment || mergedData.established || mergedData.since || '';
            importedTextData.history = mergedData.history || mergedData.briefhistory || mergedData.background || mergedData.description || '';
          } else if (sectionId === 3) {
            // HoD information
            importedTextData.hodName = mergedData.hodname || mergedData.name || mergedData.headofdepartment || mergedData.hod || '';
            importedTextData.email = mergedData.email || mergedData.emailaddress || mergedData.mail || '';
            importedTextData.phone = mergedData.phone || mergedData.phonenumber || mergedData.contact || mergedData.mobile || '';
            importedTextData.qualification = mergedData.qualification || mergedData.degree || mergedData.education || '';
          } else {
            // Section 4 or other - import all fields
            Object.keys(mergedData).forEach(key => {
              importedTextData[key] = mergedData[key];
            });
          }
          
          // Count imported fields
          const importedFieldCount = Object.values(importedTextData).filter(v => v && v.toString().trim()).length;
          
          setSectionData(prev => ({
            ...prev,
            'master': {
              ...prev['master'],
              [sectionId]: { ...prev['master']?.[sectionId], ...importedTextData }
            }
          }));
          toast.success(`Section ${sectionId}: ${importedFieldCount} field(s) auto-filled from ${file.name}!`);
        }
        // Other sections: Year-specific data
        else {
          // Merge all rows if multiple records, or use first row
          const mergedData: any = {};
          parsedData.forEach(row => {
            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');
              if (!mergedData[normalizedKey] || !mergedData[normalizedKey].trim()) {
                mergedData[normalizedKey] = row[key];
              }
            });
          });
          
          const importedTextData: SectionTextData = {};
          Object.keys(mergedData).forEach(key => {
            importedTextData[key] = mergedData[key];
          });
          
          // Count imported fields
          const importedFieldCount = Object.values(importedTextData).filter(v => v && v.toString().trim()).length;
          
          setSectionData(prev => ({
            ...prev,
            [currentYear]: {
              ...prev[currentYear],
              [sectionId]: { ...prev[currentYear]?.[sectionId], ...importedTextData }
            }
          }));
          toast.success(`Section ${sectionId}: ${importedFieldCount} field(s) auto-filled for ${currentYear} from ${file.name}!`);
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Error importing file. Please check the file format and try again.');
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  }, []);

  // Data Manipulation Functions
  const addNewRow = useCallback((sectionId: number) => {
    // Always use the selected year for consistency
    const currentYear = selectedYear;
    
    // Always update allYearData as the source of truth
    setAllYearData(prev => {
      const newData = { ...prev };
      if (!newData[currentYear]) {
        newData[currentYear] = { faculty: [], students: [], placements: [] };
      }
      
      if (sectionId === 5) {
        const newFaculty: FacultyRecord = {
          designation: 'New Position',
          count: 0,
          phd: 0,
          experience: '0-5 years'
        };
        const updatedFaculty = [...(newData[currentYear].faculty || []), newFaculty];
        newData[currentYear].faculty = updatedFaculty;
        // Update facultyData immediately
        setTimeout(() => setFacultyData(updatedFaculty), 0);
      } else if (sectionId === 7) {
        const newStudent: StudentRecord = {
          program: 'New Program',
          year: 'I Year',
          students: 0,
          intake: 0
        };
        const updatedStudents = [...(newData[currentYear].students || []), newStudent];
        newData[currentYear].students = updatedStudents;
        // Update studentData immediately
        setTimeout(() => setStudentData(updatedStudents), 0);
      } else if (sectionId === 20) {
        const newPlacement: PlacementRecord = {
          company: 'New Company',
          package: '0 LPA',
          studentsPlaced: 0,
          type: 'On-Campus'
        };
        const updatedPlacements = [...(newData[currentYear].placements || []), newPlacement];
        newData[currentYear].placements = updatedPlacements;
        // Update placementData immediately
        setTimeout(() => setPlacementData(updatedPlacements), 0);
      }
      
      return newData;
    });
    
    toast.success(`New row added for Academic Year ${currentYear}!`);
  }, [selectedYear]);

  // Show delete confirmation dialog
  const confirmDelete = useCallback((sectionId: number, index: number) => {
    setDeleteTarget({ sectionId, index });
    setShowDeleteDialog(true);
  }, []);
  
  // Execute delete after confirmation
  const deleteRow = useCallback(() => {
    if (!deleteTarget) return;
    
    const { sectionId, index } = deleteTarget;
    // Always use the selected year for consistency
    const currentYear = selectedYear;
    
    // Always update allYearData as the source of truth
    setAllYearData(prev => {
      const newData = { ...prev };
      if (!newData[currentYear]) return prev;
      
      if (sectionId === 5 && newData[currentYear].faculty) {
        newData[currentYear].faculty = newData[currentYear].faculty.filter((_, i) => i !== index);
        setFacultyData(newData[currentYear].faculty);
      } else if (sectionId === 7 && newData[currentYear].students) {
        newData[currentYear].students = newData[currentYear].students.filter((_, i) => i !== index);
        setStudentData(newData[currentYear].students);
      } else if (sectionId === 20 && newData[currentYear].placements) {
        newData[currentYear].placements = newData[currentYear].placements.filter((_, i) => i !== index);
        setPlacementData(newData[currentYear].placements);
      }
      
      return newData;
    });
    
    setShowDeleteDialog(false);
    setDeleteTarget(null);
    toast.success(`Row deleted from Academic Year ${currentYear}!`);
  }, [selectedYear, deleteTarget]);

  const startEdit = useCallback((index: number, sectionId: number) => {
    setEditingRow(index);
    // Store current row data for editing
    if (sectionId === 5) {
      setEditingRowData({ ...facultyData[index] });
    } else if (sectionId === 7) {
      setEditingRowData({ ...studentData[index] });
    } else if (sectionId === 20) {
      setEditingRowData({ ...placementData[index] });
    }
  }, [facultyData, studentData, placementData]);

  const saveEdit = useCallback((sectionId: number, index: number) => {
    if (!editingRowData) return;
    
    const currentYear = selectedYear;
    
    setAllYearData(prev => {
      const newData = { ...prev };
      if (!newData[currentYear]) return prev;
      
      if (sectionId === 5 && newData[currentYear].faculty) {
        newData[currentYear].faculty[index] = editingRowData;
        setFacultyData([...newData[currentYear].faculty]);
      } else if (sectionId === 7 && newData[currentYear].students) {
        newData[currentYear].students[index] = editingRowData;
        setStudentData([...newData[currentYear].students]);
      } else if (sectionId === 20 && newData[currentYear].placements) {
        newData[currentYear].placements[index] = editingRowData;
        setPlacementData([...newData[currentYear].placements]);
      }
      
      return newData;
    });
    
    setEditingRow(null);
    setEditingRowData(null);
    toast.success('Changes saved successfully!');
  }, [editingRowData, selectedYear]);

  const cancelEdit = useCallback(() => {
    setEditingRow(null);
    setEditingRowData(null);
  }, []);
  
  // Update field value during edit
  const updateEditField = useCallback((field: string, value: any) => {
    setEditingRowData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Save section text data
  const saveSectionData = useCallback((sectionId: number, data: SectionTextData) => {
    // For sections 1-4, save to a 'master' entry that's shared across all years
    const yearKey = (sectionId >= 1 && sectionId <= 4) ? 'master' : selectedYear;
    
    // Check if there are actual changes
    const originalData = sectionData[yearKey]?.[sectionId] || {};
    const hasChanges = JSON.stringify(originalData) !== JSON.stringify(data);
    
    if (!hasChanges && Object.keys(originalData).length > 0) {
      toast.info('No changes detected - data is already up to date');
      return;
    }
    
    // Check if there's any actual data (not just empty values)
    const hasData = Object.values(data).some(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (!hasData) {
      toast.warning('No data to save - please enter some information first');
      return;
    }
    
    setSectionData(prev => {
      const newData = { ...prev };
      if (!newData[yearKey]) {
        newData[yearKey] = {};
      }
      newData[yearKey] = {
        ...newData[yearKey],
        [sectionId]: data
      };
      return newData;
    });
    
    const yearMessage = (sectionId >= 1 && sectionId <= 4) 
      ? '(Fixed for all years)' 
      : `for ${selectedYear}`;
    const changesCount = Object.keys(data).filter(key => 
      originalData[key] !== data[key]
    ).length;
    
    if (Object.keys(originalData).length === 0) {
      toast.success(`Section ${sectionId} data saved successfully ${yearMessage}!`);
    } else {
      toast.success(`Section ${sectionId} updated with ${changesCount} changes ${yearMessage}!`);
    }
  }, [selectedYear, sectionData]);
  
  // Get section text data
  const getSectionTextData = useCallback((sectionId: number, field: string, defaultValue: any = '') => {
    // For sections 1-4, always get from 'master' entry regardless of selected year
    const yearKey = (sectionId >= 1 && sectionId <= 4) ? 'master' : selectedYear;
    return sectionData[yearKey]?.[sectionId]?.[field] || defaultValue;
  }, [sectionData, selectedYear]);
  
  // Update section text field
  const updateSectionField = useCallback((sectionId: number, field: string, value: any) => {
    // For sections 1-4, update in 'master' entry that's shared across all years
    const yearKey = (sectionId >= 1 && sectionId <= 4) ? 'master' : selectedYear;
    
    setSectionData(prev => {
      const newData = { ...prev };
      if (!newData[yearKey]) {
        newData[yearKey] = {};
      }
      if (!newData[yearKey][sectionId]) {
        newData[yearKey][sectionId] = {};
      }
      newData[yearKey] = {
        ...newData[yearKey],
        [sectionId]: {
          ...newData[yearKey][sectionId],
          [field]: value
        }
      };
      return newData;
    });
  }, [selectedYear]);

  // Sorting Functions
  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const clearSort = useCallback(() => {
    setSortConfig(null);
    toast.success('Sort cleared!');
  }, []);

  // Filter Functions
  const clearFilter = useCallback(() => {
    setFilterText('');
    toast.success('Filter cleared!');
  }, []);

  // Get sorted and filtered data
  const getSortedFilteredData = useCallback((data: any[]) => {
    let filteredData = data;
    
    if (filterText) {
      filteredData = data.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = aVal.toString().toLowerCase();
        const bStr = bVal.toString().toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filteredData;
  }, [filterText, sortConfig]);

  const openSectionModal = useCallback((section: SectionData) => {
    setSelectedSection(section);
    setIsModalOpen(true);
    setFilterText('');
    setSortConfig(null);
    setIsModalMaximized(false);
  }, []);

  const renderSectionContent = (section: SectionData) => {
    const tableHeaderStyle = { backgroundColor: primaryColor, color: 'white' };
    const currentYear = getCurrentSectionYear(section.id);
    
    // Section 1: Name of the School
    if (section.id === 1) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">School Name</Label>
              <Input 
                placeholder="Enter school name"
                className="border-gray-300"
                value={getSectionTextData(1, 'schoolName', 'GITAM School of Technology')}
                onChange={(e) => updateSectionField(1, 'schoolName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Department</Label>
              <Input 
                placeholder="Enter department name"
                className="border-gray-300"
                value={getSectionTextData(1, 'department', 'Computer Science and Engineering')}
                onChange={(e) => updateSectionField(1, 'department', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(1, sectionData['master']?.[1] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 2: Year of Establishment
    if (section.id === 2) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Year of Establishment</Label>
              <Input 
                type="number"
                placeholder="Enter year"
                className="border-gray-300"
                value={getSectionTextData(2, 'year', '1981')}
                onChange={(e) => updateSectionField(2, 'year', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Brief History</Label>
              <textarea 
                placeholder="Enter brief history"
                className="w-full min-h-24 p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
                value={getSectionTextData(2, 'history', 'GITAM School of Technology was established to provide quality technical education...')}
                onChange={(e) => updateSectionField(2, 'history', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(2, sectionData['master']?.[2] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 3: Name of the HoD
    if (section.id === 3) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">HoD Name</Label>
              <Input 
                placeholder="Enter Head of Department name"
                className="border-gray-300"
                value={getSectionTextData(3, 'hodName', 'Gondi Lakshmeeswari')}
                onChange={(e) => updateSectionField(3, 'hodName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Email</Label>
              <Input 
                type="email"
                placeholder="Enter email address"
                className="border-gray-300"
                value={getSectionTextData(3, 'email', 'hod_cse@gitam.edu')}
                onChange={(e) => updateSectionField(3, 'email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Phone</Label>
              <Input 
                type="tel"
                placeholder="Enter phone number"
                className="border-gray-300"
                value={getSectionTextData(3, 'phone', '089128402870')}
                onChange={(e) => updateSectionField(3, 'phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Qualification</Label>
              <Input 
                placeholder="Enter qualification details"
                className="border-gray-300"
                value={getSectionTextData(3, 'qualification', 'PhD')}
                onChange={(e) => updateSectionField(3, 'qualification', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(3, sectionData['master']?.[3] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 4: Programs Offered
    if (section.id === 4) {
      // Determine curriculum year based on selected academic year
      const curriculumYear = selectedYear === '2023-24' ? '2023' : '2024';
      const showData = selectedYear === '2024-25' || selectedYear === '2023-24';
      
      if (!showData) {
        return (
          <div className="space-y-8">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Program Data Available</h4>
              <p className="text-gray-500">Program data is only available for Academic Years 2023-24 and 2024-25.</p>
              <p className="text-sm text-gray-400 mt-2">Currently viewing: {selectedYear}</p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="space-y-8">
          {/* Undergraduate Programs */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Undergraduate Programs</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">S.No</TableHead>
                    <TableHead className="text-white">Program</TableHead>
                    <TableHead className="text-white">Duration (Years)</TableHead>
                    <TableHead className="text-white">Latest Revision of Curriculum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>B.Tech. Computer Science and Engineering (AI & ML)</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>B.Tech. Computer Science and Engineering (Cyber Security)</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>B.Tech. Computer Science and Engineering (Data Science)</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4</TableCell>
                    <TableCell>B.Tech. Biomedical Engineering</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>5</TableCell>
                    <TableCell>B.Tech. Biotechnology</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>6</TableCell>
                    <TableCell>B.Tech. Civil Engineering with Computer Application</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>7</TableCell>
                    <TableCell>B.Tech. Computer Science and Engineering</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>8</TableCell>
                    <TableCell>B.Tech. Electrical and Computer Engineering</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>9</TableCell>
                    <TableCell>B.Tech. Electronics and Communications Engineering</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>10</TableCell>
                    <TableCell>B.Tech. Electronics and Engineering (VLSI Design and Technology)</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>11</TableCell>
                    <TableCell>B.Tech. Mechanical Engineering</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>12</TableCell>
                    <TableCell>B.Tech. Robotics & Artificial Intelligence</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Postgraduate Programs */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Postgraduate Programs</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">S.No</TableHead>
                    <TableHead className="text-white">Department</TableHead>
                    <TableHead className="text-white">Program</TableHead>
                    <TableHead className="text-white">Duration (Years)</TableHead>
                    <TableHead className="text-white">Latest Revision of Curriculum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Data Science</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Food Processing Technology</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Structural Engineering</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Construction Technology and Management</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>5</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Computer Science and Engineering</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>6</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. VLSI Design</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>7</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Power System and Automation</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>8</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Machine Design and Robotics</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>9</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Manufacturing Technology and Automation</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>10</TableCell>
                    <TableCell>Engineering</TableCell>
                    <TableCell>M.Tech. Geotechnical Engineering</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Ph.D. Programs */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Ph.D. Programs</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">S.No</TableHead>
                    <TableHead className="text-white">Name of Program</TableHead>
                    <TableHead className="text-white">Duration (Years)</TableHead>
                    <TableHead className="text-white">Latest Revision of Curriculum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Ph.D. in Biotechnology</TableCell>
                    <TableCell>3–5</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>Ph.D. in Civil Engineering</TableCell>
                    <TableCell>3–5</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>Ph.D. in Computer Science & Engineering</TableCell>
                    <TableCell>3–5</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4</TableCell>
                    <TableCell>Ph.D. in Electronics & Communication Engineering</TableCell>
                    <TableCell>3–5</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>5</TableCell>
                    <TableCell>Ph.D. in Electrical & Electronics Engineering</TableCell>
                    <TableCell>3–5</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>6</TableCell>
                    <TableCell>Ph.D. in Mechanical Engineering</TableCell>
                    <TableCell>3–5</TableCell>
                    <TableCell>{curriculumYear}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(4, sectionData['master']?.[4] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 5: Number of Faculty
    if (section.id === 5) {
      const currentFacultyData = getSectionData(section.id, 'faculty');
      const sortedFilteredFacultyData = getSortedFilteredData(currentFacultyData);
      
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold text-gray-900">Faculty Data for Academic Year {selectedYear}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.gitam.edu/about/faculty?campus_id=2&discipline_id=20&dept_id=68', '_blank')}
                className="flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
                type="button"
              >
                <ExternalLink className="w-4 h-4" />
                View Faculty
              </Button>
            </div>
            <Badge variant="outline" className="text-xs">
              {currentFacultyData.length} Records
            </Badge>
          </div>
          
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white cursor-pointer" onClick={() => handleSort('designation')}>
                    <div className="flex items-center gap-2">
                      Designation
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-white cursor-pointer" onClick={() => handleSort('count')}>
                    <div className="flex items-center gap-2">
                      Count
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-white cursor-pointer" onClick={() => handleSort('phd')}>
                    <div className="flex items-center gap-2">
                      Ph.D. Holders
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-white cursor-pointer" onClick={() => handleSort('experience')}>
                    <div className="flex items-center gap-2">
                      Experience
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFilteredFacultyData.map((faculty, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {editingRow === index ? (
                        <Input 
                          value={editingRowData?.designation || faculty.designation}
                          onChange={(e) => updateEditField('designation', e.target.value)}
                          className="border-gray-300"
                        />
                      ) : (
                        faculty.designation
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Input 
                          type="number"
                          value={editingRowData?.count || faculty.count}
                          onChange={(e) => updateEditField('count', parseInt(e.target.value) || 0)}
                          className="border-gray-300 w-20"
                        />
                      ) : (
                        <Badge variant="secondary">{faculty.count}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Input 
                          type="number"
                          value={editingRowData?.phd || faculty.phd}
                          onChange={(e) => updateEditField('phd', parseInt(e.target.value) || 0)}
                          className="border-gray-300 w-20"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{faculty.phd}</span>
                          <span className="text-xs text-gray-500">
                            ({faculty.count > 0 ? Math.round((faculty.phd / faculty.count) * 100) : 0}%)
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {editingRow === index ? (
                        <Input 
                          value={editingRowData?.experience || faculty.experience}
                          onChange={(e) => updateEditField('experience', e.target.value)}
                          className="border-gray-300"
                        />
                      ) : (
                        faculty.experience
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingRow === index ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(section.id, index)} type="button">
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} type="button">
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(index, section.id)} type="button">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => confirmDelete(section.id, index)}
                              className="text-red-600 hover:text-red-700"
                              type="button"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(5, sectionData[selectedYear]?.[5] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 6: Number of Non-Teaching Staff
    if (section.id === 6) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Number of Non-Teaching Staff</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Designation</TableHead>
                  <TableHead className="text-white">Male</TableHead>
                  <TableHead className="text-white">Female</TableHead>
                  <TableHead className="text-white">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter designation" className="border-gray-300" /></TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(6, sectionData[selectedYear]?.[6] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 7: Program-wise Student Strength
    if (section.id === 7) {
      const currentStudentData = getSectionData(section.id, 'students');
      const sortedFilteredStudentData = getSortedFilteredData(currentStudentData);
      
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Student Enrollment for Academic Year {selectedYear}</h4>
            <Badge variant="outline" className="text-xs">
              {currentStudentData.length} Programs
            </Badge>
          </div>
          
          {currentStudentData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('program')}>
                      <div className="flex items-center gap-2">
                        Program
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('year')}>
                      <div className="flex items-center gap-2">
                        Year
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('students')}>
                      <div className="flex items-center gap-2">
                        Current Students
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('intake')}>
                      <div className="flex items-center gap-2">
                        Intake Capacity
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white">Occupancy</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFilteredStudentData.map((student, index) => {
                    const currentData = editingRow === index && editingRowData ? editingRowData : student;
                    const occupancyRate = currentData.intake > 0 ? Math.round((currentData.students / currentData.intake) * 100) : 0;
                    const occupancyColor = occupancyRate >= 90 ? 'text-green-600' : occupancyRate >= 70 ? 'text-yellow-600' : 'text-red-600';
                    
                    return (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {editingRow === index ? (
                            <Input 
                              value={editingRowData?.program || student.program}
                              onChange={(e) => updateEditField('program', e.target.value)}
                              className="border-gray-300"
                            />
                          ) : (
                            student.program
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === index ? (
                            <Input 
                              value={editingRowData?.year || student.year}
                              onChange={(e) => updateEditField('year', e.target.value)}
                              className="border-gray-300"
                            />
                          ) : (
                            <Badge variant="outline">{student.year}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === index ? (
                            <Input 
                              type="number"
                              value={editingRowData?.students || student.students}
                              onChange={(e) => updateEditField('students', parseInt(e.target.value) || 0)}
                              className="border-gray-300 w-20"
                            />
                          ) : (
                            <Badge variant="secondary">{student.students}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === index ? (
                            <Input 
                              type="number"
                              value={editingRowData?.intake || student.intake}
                              onChange={(e) => updateEditField('intake', parseInt(e.target.value) || 0)}
                              className="border-gray-300 w-20"
                            />
                          ) : (
                            student.intake
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${occupancyColor}`}>
                              {occupancyRate}%
                            </span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${occupancyRate >= 90 ? 'bg-green-500' : occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {editingRow === index ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(section.id, index)} type="button">
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} type="button">
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEdit(index, section.id)} type="button">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => deleteRow(section.id, index)}
                                  className="text-red-600 hover:text-red-700"
                                  type="button"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Data</h3>
              <p className="text-gray-500 mb-4">No student enrollment data available for academic year {selectedYear}</p>
              <Button 
                onClick={() => addNewRow(section.id)}
                style={{ backgroundColor: primaryColor }}
                className="text-white"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student Record
              </Button>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(7, sectionData[selectedYear]?.[7] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 8: Ph.D. Degrees obtained by Faculty
    if (section.id === 8) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Ph.D. Degrees obtained by Faculty</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Faculty Name</TableHead>
                  <TableHead className="text-white">Thesis Title</TableHead>
                  <TableHead className="text-white">University</TableHead>
                  <TableHead className="text-white">Month & Year of Award</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter faculty name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter thesis title" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter university name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="MM/YYYY" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(8, sectionData[selectedYear]?.[8] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 9: Research (Ph.D.) Guidance by Faculty
    if (section.id === 9) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Research (Ph.D.) Guidance by Faculty</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Supervisor Name</TableHead>
                  <TableHead className="text-white">Thesis Title</TableHead>
                  <TableHead className="text-white">Research Scholar</TableHead>
                  <TableHead className="text-white">Month & Year of Award</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter supervisor name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter thesis title" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter scholar name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="MM/YYYY" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(9, sectionData[selectedYear]?.[9] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 10: Recharging Programs Organized
    if (section.id === 10) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Recharging Programs Organized</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">Program Type</TableHead>
                  <TableHead className="text-white">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">International Conferences</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">National Conferences</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">FDP</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Workshops</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Guest Lectures</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">STTP</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Webinars</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(10, sectionData[selectedYear]?.[10] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 11: Recharging Programs Attended
    if (section.id === 11) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Recharging Programs Attended</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">Program Type</TableHead>
                  <TableHead className="text-white">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">International Conferences</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">National Conferences</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">FDP</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Workshops</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Guest Lectures</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">STTP</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Webinars</TableCell><TableCell><Input type="number" placeholder="0" className="border-gray-300 w-24" /></TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(11, sectionData[selectedYear]?.[11] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 12: Funded Research Projects
    if (section.id === 12) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Funded Research Projects</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Principal Investigator</TableHead>
                  <TableHead className="text-white">Project Title</TableHead>
                  <TableHead className="text-white">Funding Agency</TableHead>
                  <TableHead className="text-white">Sanctioned Amount (₹ Lakhs)</TableHead>
                  <TableHead className="text-white">Duration (Month & Year)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter PI name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter project title" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter funding agency" className="border-gray-300" /></TableCell>
                  <TableCell><Input type="number" step="0.01" placeholder="0.00" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="MM/YYYY - MM/YYYY" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(12, sectionData[selectedYear]?.[12] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 13: Consultancy Projects
    if (section.id === 13) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Consultancy Projects</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Faculty Name</TableHead>
                  <TableHead className="text-white">Project Title</TableHead>
                  <TableHead className="text-white">Client</TableHead>
                  <TableHead className="text-white">Sanctioned Amount (₹ Lakhs)</TableHead>
                  <TableHead className="text-white">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter faculty name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter project title" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter client name" className="border-gray-300" /></TableCell>
                  <TableCell><Input type="number" step="0.01" placeholder="0.00" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter duration" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(13, sectionData[selectedYear]?.[13] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 14: Research Profile
    if (section.id === 14) {
      return (
        <div className="space-y-8">
          {/* Journal Publications */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Journal Publications</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">Q1</TableHead>
                    <TableHead className="text-white">Q2</TableHead>
                    <TableHead className="text-white">Q3</TableHead>
                    <TableHead className="text-white">Q4</TableHead>
                    <TableHead className="text-white">IF Range</TableHead>
                    <TableHead className="text-white">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-16" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-16" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-16" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-16" /></TableCell>
                    <TableCell><Input placeholder="0.0 - 0.0" className="border-gray-300" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-16" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Conference Publications */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Conference Publications</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">National</TableHead>
                    <TableHead className="text-white">International</TableHead>
                    <TableHead className="text-white">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(14, sectionData[selectedYear]?.[14] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 15: Books / Book Chapters
    if (section.id === 15) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Books / Book Chapters</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Author(s)</TableHead>
                  <TableHead className="text-white">Publisher</TableHead>
                  <TableHead className="text-white">Month & Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter title" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter author(s)" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter publisher" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="MM/YYYY" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(15, sectionData[selectedYear]?.[15] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 16: Patents by Faculty
    if (section.id === 16) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Patents by Faculty</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Faculty Name</TableHead>
                  <TableHead className="text-white">Invention Title</TableHead>
                  <TableHead className="text-white">Patent Number & Date</TableHead>
                  <TableHead className="text-white">Indian/International</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter faculty name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter invention title" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Patent No. & Date" className="border-gray-300" /></TableCell>
                  <TableCell>
                    <Select>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filed">Filed</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="granted">Granted</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(16, sectionData[selectedYear]?.[16] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 17: MoUs / Collaborations
    if (section.id === 17) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">MoUs / Collaborations</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Collaborating Agency</TableHead>
                  <TableHead className="text-white">Nature of Collaboration</TableHead>
                  <TableHead className="text-white">Date of Signing</TableHead>
                  <TableHead className="text-white">Validity (Years)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter agency name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter collaboration type" className="border-gray-300" /></TableCell>
                  <TableCell><Input type="date" className="border-gray-300" /></TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(17, sectionData[selectedYear]?.[17] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 18: Faculty Achievements
    if (section.id === 18) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Faculty Achievements</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Faculty Name</TableHead>
                  <TableHead className="text-white">Award Nature</TableHead>
                  <TableHead className="text-white">Awarding Agency</TableHead>
                  <TableHead className="text-white">Award Position</TableHead>
                  <TableHead className="text-white">Month & Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter faculty name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter award type" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter awarding agency" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter position" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="MM/YYYY" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(18, sectionData[selectedYear]?.[18] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 19: Student Achievements
    if (section.id === 19) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Student Achievements</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Student Name</TableHead>
                  <TableHead className="text-white">Award Nature</TableHead>
                  <TableHead className="text-white">Awarding Agency</TableHead>
                  <TableHead className="text-white">Award Position</TableHead>
                  <TableHead className="text-white">Month & Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input placeholder="Enter student name" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter award type" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter awarding agency" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="Enter position" className="border-gray-300" /></TableCell>
                  <TableCell><Input placeholder="MM/YYYY" className="border-gray-300" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(19, sectionData[selectedYear]?.[19] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 20: Placements
    if (section.id === 20) {
      const currentPlacementData = getSectionData(section.id, 'placements');
      const sortedFilteredPlacementData = getSortedFilteredData(currentPlacementData);
      
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Placement Statistics for Academic Year {selectedYear}</h4>
            <Badge variant="outline" className="text-xs">
              {currentPlacementData.length} Companies
            </Badge>
          </div>
          
          {currentPlacementData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentPlacementData.reduce((sum, p) => sum + p.studentsPlaced, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Students Placed</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentPlacementData.length}
                  </div>
                  <div className="text-sm text-gray-600">Recruiting Companies</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...currentPlacementData.map(p => parseInt(p.package.replace(' LPA', '')) || 0))} LPA
                  </div>
                  <div className="text-sm text-gray-600">Highest Package</div>
                </div>
              </Card>
            </div>
          )}
          
          {currentPlacementData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('company')}>
                      <div className="flex items-center gap-2">
                        Company
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('package')}>
                      <div className="flex items-center gap-2">
                        Package
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('studentsPlaced')}>
                      <div className="flex items-center gap-2">
                        Students Placed
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white cursor-pointer" onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-2">
                        Type
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFilteredPlacementData.map((placement, index) => {
                    const currentData = editingRow === index && editingRowData ? editingRowData : placement;
                    const packageValue = parseInt(currentData.package.replace(' LPA', '')) || 0;
                    const packageColor = packageValue >= 20 ? 'text-green-600' : packageValue >= 10 ? 'text-blue-600' : 'text-gray-600';
                    
                    return (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {editingRow === index ? (
                            <Input 
                              value={editingRowData?.company || placement.company}
                              onChange={(e) => updateEditField('company', e.target.value)}
                              className="border-gray-300"
                            />
                          ) : (
                            placement.company
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === index ? (
                            <Input 
                              value={editingRowData?.package || placement.package}
                              onChange={(e) => updateEditField('package', e.target.value)}
                              className="border-gray-300"
                              placeholder="XX LPA"
                            />
                          ) : (
                            <Badge variant="outline" className={packageColor}>
                              {placement.package}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === index ? (
                            <Input 
                              type="number"
                              value={editingRowData?.studentsPlaced || placement.studentsPlaced}
                              onChange={(e) => updateEditField('studentsPlaced', parseInt(e.target.value) || 0)}
                              className="border-gray-300 w-20"
                            />
                          ) : (
                            <Badge variant="secondary">{placement.studentsPlaced}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === index ? (
                            <Select 
                              value={editingRowData?.type || placement.type}
                              onValueChange={(value) => updateEditField('type', value)}
                            >
                              <SelectTrigger className="border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="On-Campus">On-Campus</SelectItem>
                                <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant={placement.type === 'On-Campus' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {placement.type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {editingRow === index ? (
                              <>
                                <Button size="sm" onClick={() => saveEdit(section.id, index)} type="button">
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} type="button">
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEdit(index, section.id)} type="button">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => deleteRow(section.id, index)}
                                  className="text-red-600 hover:text-red-700"
                                  type="button"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Placement Data</h3>
              <p className="text-gray-500 mb-4">No placement data available for academic year {selectedYear}</p>
              <Button 
                onClick={() => addNewRow(section.id)}
                style={{ backgroundColor: primaryColor }}
                className="text-white"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Placement Record
              </Button>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(20, sectionData[selectedYear]?.[20] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 21: Internships
    if (section.id === 21) {
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">Internships</h4>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={tableHeaderStyle}>
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">No. of Students</TableHead>
                  <TableHead className="text-white">Non-Paid Internships</TableHead>
                  <TableHead className="text-white">Paid Internships</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                  <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(21, sectionData[selectedYear]?.[21] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 22: Result Analysis
    if (section.id === 22) {
      return (
        <div className="space-y-8">
          {/* Overall Results */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Results</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">S.No</TableHead>
                    <TableHead className="text-white">Semester</TableHead>
                    <TableHead className="text-white">Total Students</TableHead>
                    <TableHead className="text-white">% Pass</TableHead>
                    <TableHead className="text-white">% Fail</TableHead>
                    <TableHead className="text-white">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell><Input placeholder="Semester I" className="border-gray-300" /></TableCell>
                    <TableCell><Input type="number" placeholder="0" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input type="number" step="0.01" placeholder="0.00" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input type="number" step="0.01" placeholder="0.00" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input placeholder="Enter remarks" className="border-gray-300" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Course-wise Results */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Results</h4>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={tableHeaderStyle}>
                    <TableHead className="text-white">S.No</TableHead>
                    <TableHead className="text-white">Course Name</TableHead>
                    <TableHead className="text-white">Faculty</TableHead>
                    <TableHead className="text-white">% Pass</TableHead>
                    <TableHead className="text-white">% Fail</TableHead>
                    <TableHead className="text-white">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell><Input placeholder="Enter course name" className="border-gray-300" /></TableCell>
                    <TableCell><Input placeholder="Enter faculty name" className="border-gray-300" /></TableCell>
                    <TableCell><Input type="number" step="0.01" placeholder="0.00" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input type="number" step="0.01" placeholder="0.00" className="border-gray-300 w-20" /></TableCell>
                    <TableCell><Input placeholder="Enter remarks" className="border-gray-300" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(22, sectionData[selectedYear]?.[22] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 23: Steps to Improve Academic Performance
    if (section.id === 23) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Steps to Improve Academic Performance of Students</Label>
            <textarea 
              placeholder="Enter detailed steps and strategies to improve student academic performance..."
              className="w-full min-h-64 p-4 border border-gray-300 rounded-lg resize-none"
              rows={10}
              value={getSectionTextData(23, 'steps', '')}
              onChange={(e) => updateSectionField(23, 'steps', e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(23, sectionData[selectedYear]?.[23] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Section 24: Steps for Faculty Engagement & Publications
    if (section.id === 24) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Steps to Improve Faculty Engagement / Research Projects / External Funding</Label>
            <textarea 
              placeholder="Enter detailed steps and strategies to improve faculty engagement, research projects, and external funding..."
              className="w-full min-h-64 p-4 border border-gray-300 rounded-lg resize-none"
              rows={10}
              value={getSectionTextData(24, 'steps', '')}
              onChange={(e) => updateSectionField(24, 'steps', e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button 
              style={{ backgroundColor: primaryColor }} 
              className="text-white"
              onClick={() => saveSectionData(24, sectionData[selectedYear]?.[24] || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Section
            </Button>
          </div>
        </div>
      );
    }

    // Default empty state for any undefined sections
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <section.icon className="w-16 h-16 mx-auto text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Section Template Ready</h3>
        <p className="text-gray-500 mb-6">Official template for {section.title} - ready for data input.</p>
        <div className="flex justify-center">
          <Button style={{ backgroundColor: primaryColor }} className="text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Section
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={processExcelFile}
        accept=".xlsx,.xls,.csv,.json,.txt,.doc,.docx"
        style={{ display: 'none' }}
      />

      {/* App Bar */}
      <header className="bg-white shadow-sm border-b-2 sticky top-0 z-40" style={{ borderBottomColor: primaryColor }}>
        <div className="max-w-screen-xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex-shrink-0">
                <img 
                  src={gitamLogo} 
                  alt="GITAM Deemed to be University Logo" 
                  className="h-10 w-auto object-contain"
                  style={{ maxHeight: '40px' }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate" style={{ color: primaryColor }}>
                  Annual Report Portal
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 flex-shrink-0 text-xs px-2 py-1"
                onClick={handleHome}
                type="button"
              >
                <Home className="w-3 h-3 mr-1" />
                Home
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 flex-shrink-0 text-xs px-2 py-1"
                onClick={handleRefreshData}
                type="button"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 flex-shrink-0 text-xs px-2 py-1"
                onClick={handleNotifications}
                type="button"
              >
                <Bell className="w-3 h-3 mr-1" />
                Alerts
              </Button>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32 flex-shrink-0 h-8 text-xs">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year} value={year}>A.Y. {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>


              
              <div className="relative flex-shrink-0">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 w-48 border-gray-300 focus:border-primary focus:ring-primary h-8 text-xs"
                  style={{ borderRadius: '8px' }}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 flex-shrink-0 text-xs px-2 py-1"
                onClick={() => setIsSettingsOpen(true)}
                type="button"
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 flex-shrink-0 text-xs px-2 py-1"
                onClick={handleHelp}
                type="button"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                Help
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-red-600 border-red-200 flex-shrink-0 text-xs px-2 py-1"
                type="button"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar Navigation */}
        <aside className="w-80 bg-white border-r border-gray-200 sticky top-16 h-screen flex-shrink-0" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <ScrollArea className="h-full">
            <div className="p-6">
              <h2 className="font-semibold mb-6 text-lg" style={{ color: primaryColor }}>
                Report Sections
              </h2>
              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => openSectionModal(section)}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200 relative"
                    style={{ borderRadius: '12px' }}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2.5 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${section.color}15`, borderRadius: '8px' }}
                      >
                        <section.icon className="w-5 h-5" style={{ color: section.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 group-hover:text-gray-700 mb-1 line-clamp-2">
                          {section.title}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {section.description}
                        </div>
                      </div>
                      {hasSectionData(section.id) && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto" style={{ marginLeft: '24px' }}>
          <div className="max-w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <img 
                    src={gitamLogo} 
                    alt="GITAM Deemed to be University Logo" 
                    className="h-12 w-auto object-contain"
                    style={{ maxHeight: '48px' }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold" style={{ color: primaryColor }}>
                    Annual Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Displaying data for Academic Year <span className="font-semibold" style={{ color: primaryColor }}>{selectedYear}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Button variant="outline" onClick={handlePrint} type="button">
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleDownloadReport} type="button">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-12 gap-6 mb-8">
              <Card className="col-span-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                    style={{ borderRadius: '12px', border: `1px solid ${primaryColor}20` }}
                    onClick={() => toast.info(`Academic Year ${selectedYear}: Faculty ${facultyData.length}, Students ${studentData.length}, Placements ${placementData.length}`)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Year {selectedYear}</p>
                      <p className="text-3xl font-semibold" style={{ color: primaryColor }}>
                        {facultyData.reduce((sum, f) => sum + f.count, 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Faculty members</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
                      <Users className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                    style={{ borderRadius: '12px', border: `1px solid ${accentColor}20` }}
                    onClick={() => toast.info(`Students for ${selectedYear}: ${studentData.reduce((sum, s) => sum + s.students, 0)} enrolled`)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Students {selectedYear}</p>
                      <p className="text-3xl font-semibold" style={{ color: accentColor }}>
                        {studentData.reduce((sum, s) => sum + s.students, 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Total enrollment</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                      <GraduationCap className="w-8 h-8" style={{ color: accentColor }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                    style={{ borderRadius: '12px', border: '1px solid #10b981' }}
                    onClick={() => toast.info(`Placements for ${selectedYear}: ${placementData.reduce((sum, p) => sum + p.studentsPlaced, 0)} students placed`)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Placements {selectedYear}</p>
                      <p className="text-3xl font-semibold text-green-600">
                        {placementData.reduce((sum, p) => sum + p.studentsPlaced, 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Students placed</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <Briefcase className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section Tiles Grid */}
            <div className="grid grid-cols-12 gap-4">
              {filteredSections.map((section) => (
                <Card
                  key={section.id}
                  className="col-span-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group relative"
                  style={{ 
                    borderRadius: '12px', 
                    border: `1px solid ${section.color}20`,
                    minHeight: '140px'
                  }}
                  onClick={() => openSectionModal(section)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: `${section.color}15`, borderRadius: '8px' }}
                      >
                        <section.icon className="w-5 h-5" style={{ color: section.color }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium"
                          style={{ color: section.color, borderColor: `${section.color}30` }}
                        >
                          {section.id}
                        </Badge>
                        {hasSectionData(section.id) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h3 className="font-semibold text-sm mb-2 leading-tight group-hover:text-gray-700 line-clamp-2">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {section.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Excel Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="overflow-hidden"
          style={{ 
            borderRadius: '12px',
            maxWidth: isModalMaximized ? '98vw' : '90vw',
            maxHeight: isModalMaximized ? '98vh' : '95vh',
            width: isModalMaximized ? '98vw' : '90vw'
          }}
        >
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              {selectedSection && (
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="p-3 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${selectedSection.color}15`, borderRadius: '8px' }}
                  >
                    <selectedSection.icon className="w-6 h-6" style={{ color: selectedSection.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-semibold">{selectedSection.title}</span>
                      {selectedSection.title.includes('(confirm label)') && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Confirm Label
                        </Badge>
                      )}
                      {hasSectionData(selectedSection.id) && (
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                          Has Data
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-normal mt-1 line-clamp-2">
                      {selectedSection.description}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsModalMaximized(!isModalMaximized)}
                  className="border-gray-300"
                  type="button"
                >
                  {isModalMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Manage and view data for {selectedSection?.title}. Import documents (CSV, JSON, TXT, DOC) to auto-fill matching fields, or manually add and edit data. Export anytime to PDF & CSV.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between border-b pb-4 flex-shrink-0 gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Filter data..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-8 w-40 h-8 text-sm"
                />
              </div>
              {filterText && (
                <Button size="sm" variant="outline" className="border-gray-300 h-8" onClick={clearFilter} type="button">
                  <FilterX className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              {sortConfig && (
                <Button size="sm" variant="outline" className="border-gray-300 h-8" onClick={clearSort} type="button">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  Clear Sort
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">

              <Button 
                size="sm" 
                variant="outline" 
                className="border-gray-300"
                onClick={() => selectedSection && handleExportExcel(selectedSection.id)}
                type="button"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF & CSV
              </Button>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-300"
                  onClick={() => selectedSection && handleImportDocument(selectedSection.id)}
                  type="button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Doc
                </Button>
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 cursor-help border-blue-200 bg-blue-50 text-blue-700"
                  title="Supports: CSV, JSON, TXT, DOC, DOCX, Excel files. Fields will be auto-matched and filled."
                >
                  <Info className="w-3 h-3 mr-1" />
                  Multi-format
                </Badge>
              </div>
              <Button 
                size="sm" 
                className="text-white" 
                style={{ backgroundColor: primaryColor, borderRadius: '8px' }}
                onClick={() => selectedSection && addNewRow(selectedSection.id)}
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1" style={{ maxHeight: isModalMaximized ? 'calc(98vh - 220px)' : 'calc(95vh - 220px)' }}>
            <div className="p-4">
              {selectedSection && renderSectionContent(selectedSection)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* File Viewer Dialog */}
      <Dialog open={showFileViewer} onOpenChange={setShowFileViewer}>
        <DialogContent className="max-w-4xl" style={{ maxHeight: '90vh' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5" style={{ color: primaryColor }} />
              File Viewer: {selectedFile?.name}
            </DialogTitle>
            <DialogDescription>
              View details and preview content for the imported file.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="p-4">
              {selectedFile && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Name:</span> {selectedFile.name}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedFile.type || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Imported:</span> {selectedFile.lastModified.toLocaleString()}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">File Content Preview:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                      {selectedFile.content || 'Content preview not available'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button onClick={() => setShowFileViewer(false)} type="button">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Application Settings</DialogTitle>
            <DialogDescription>
              Configure your application preferences and default settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <Label>Academic Year</Label>
              <Select defaultValue="2024-25">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Export Format</Label>
              <Select defaultValue="xlsx">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Auto-save Interval</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)} type="button">
                Cancel
              </Button>
              <Button onClick={() => {
                setIsSettingsOpen(false);
                toast.success('Settings saved successfully!');
              }} type="button">
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Bell className="w-5 h-5" style={{ color: primaryColor }} />
              Notifications & Alerts
            </DialogTitle>
            <DialogDescription>
              Stay updated with system notifications and important alerts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">System Update</p>
                <p className="text-sm text-blue-800">New features added to Excel import/export</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-900">Data Reminder</p>
                <p className="text-sm text-yellow-800">21 sections still need data input</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">Auto-saved</p>
                <p className="text-sm text-green-800">Your data has been automatically saved</p>
              </div>
            </div>
            <Button onClick={() => setShowNotifications(false)} className="w-full" type="button">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5" style={{ color: primaryColor }} />
              Help & Support
            </DialogTitle>
            <DialogDescription>
              Get help with using the GITAM Annual Report Portal and its features.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-6 p-4">
              <div>
                <h4 className="font-semibold mb-2">Getting Started</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click on any section tile to add or view data</li>
                  <li>• Use the search bar to find specific sections</li>
                  <li>• Import documents (CSV, JSON, TXT, DOC, Excel) to auto-fill fields</li>
                  <li>• Export data to CSV/PDF format anytime</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Management</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click Edit button to modify existing data</li>
                  <li>• Use Add Row to create new entries</li>
                  <li>• Sort columns by clicking column headers</li>
                  <li>• Filter data using the search box</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">PDF Downloads</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click "Download All Data (PDF)" to export everything</li>
                  <li>• Click "Annual Report (PDF)" for year-specific report</li>
                  <li>• Individual sections export both PDF and CSV</li>
                  <li>• Professional formatting with GITAM branding</li>
                  <li>• Comprehensive reports with summaries and charts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Import Document Features</h4>
                <p className="text-sm text-gray-600 mb-2">The system intelligently parses and auto-fills matching fields from your documents.</p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>CSV Files:</strong> Standard comma-separated format with headers</li>
                  <li>• <strong>JSON Files:</strong> Array of objects or single object format</li>
                  <li>• <strong>Text Files (.txt, .doc):</strong> Key-value pairs (e.g., "Name: John")</li>
                  <li>• <strong>Excel Files:</strong> .xlsx and .xls formats</li>
                  <li>• Smart field matching handles variations in field names</li>
                  <li>• Shows count of fields auto-filled after import</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">File Management</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• View imported files using the "View Files" button</li>
                  <li>• Preview file content and metadata</li>
                  <li>• Track import history for each section</li>
                  <li>• Export data in multiple formats (PDF & CSV)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Auto-save functionality</li>
                  <li>• Print reports</li>
                  <li>• Share and send reports via email</li>
                  <li>• Full-screen modal view</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.open('mailto:support@gitam.edu')} type="button">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Button onClick={() => setShowHelp(false)} type="button">
                  Got it
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this row? This action cannot be undone and the data will be permanently removed from Academic Year {selectedYear}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteRow}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}