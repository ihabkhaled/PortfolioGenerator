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
  Eye as PreviewIcon,
  FileText as DocumentIcon,
  Globe as GlobeIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  LoaderCircle as SpinnerIcon,
  Mail as MailIcon,
  MapPin as LocationIcon,
  Menu as MenuIcon,
  Moon as MoonIcon,
  Phone as PhoneIcon,
  Plus as AddIcon,
  Rocket as PublishIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Sun as SunIcon,
  Trash2 as DeleteIcon,
  Upload as UploadIcon,
  User as UserIcon,
  X as CloseIcon,
  type LucideIcon as AppIcon,
} from 'lucide-react';
