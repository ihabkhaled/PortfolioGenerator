/**
 * Owner of `lucide-react`. Icons are re-exported by role, not by vendor name,
 * so swapping the icon set is a one-file change and call sites read as intent.
 *
 * Brand marks (GitHub, LinkedIn, X) are deliberately absent: lucide dropped
 * them in v1, and trademarked logos do not belong in a general icon set
 * anyway. They live as inline SVG in
 * `src/shared/components/primitives/brand-mark.tsx`.
 */

export {
  AlertTriangle as WarningIcon,
  ArrowLeft as BackIcon,
  ArrowRight as ForwardIcon,
  ArrowUpRight as ExternalIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  CircleAlert as ErrorIcon,
  Copy as CopyIcon,
  Code2 as CodeIcon,
  Camera as CameraIcon,
  Eye as PreviewIcon,
  EyeOff as HidePreviewIcon,
  FileText as DocumentIcon,
  Globe as GlobeIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  LoaderCircle as SpinnerIcon,
  LogIn as SignInIcon,
  Mail as MailIcon,
  MessageCircle as MessageIcon,
  MapPin as LocationIcon,
  House as HomeIcon,
  Menu as MenuIcon,
  Monitor as MonitorIcon,
  Moon as MoonIcon,
  Phone as PhoneIcon,
  Plus as AddIcon,
  Rocket as PublishIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Sun as SunIcon,
  Trash2 as DeleteIcon,
  Upload as UploadIcon,
  UserPlus as SignUpIcon,
  Video as VideoIcon,
  User as UserIcon,
  X as CloseIcon,
  type LucideIcon as AppIcon,
} from 'lucide-react';
