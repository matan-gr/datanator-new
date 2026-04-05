import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, RefreshCw, AlertCircle, Activity, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'SUCCESS':
    case 'HEALTHY':
      return <Badge variant="outline" className="status-badge status-success"><CheckCircle2 className="w-3 h-3 mr-1" /> {status}</Badge>;
    case 'RUNNING':
      return <Badge variant="outline" className="status-badge status-info"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> {status}</Badge>;
    case 'PARTIAL_SUCCESS':
    case 'DEGRADED':
      return <Badge variant="outline" className="status-badge status-warning"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    case 'FAILED':
    case 'FAILING':
    case 'ERROR':
      return <Badge variant="outline" className="status-badge status-error"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    case 'INFO':
      return <Badge variant="outline" className="status-badge status-info"><Activity className="w-3 h-3 mr-1" /> {status}</Badge>;
    case 'WARN':
    case 'WARNING':
      return <Badge variant="outline" className="status-badge status-warning"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    default:
      return <Badge variant="outline" className="status-badge border-border text-foreground rounded-full">{status}</Badge>;
  }
};

export const StatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case 'SUCCESS':
      return <span className="status-badge status-success text-[11px] py-0.5"><CheckCircle2 className="w-3 h-3" /> Pass</span>;
    case 'RUNNING':
      return <span className="status-badge status-info text-[11px] py-0.5"><RefreshCw className="w-3 h-3 animate-spin" /> Running</span>;
    case 'PARTIAL_SUCCESS':
      return <span className="status-badge status-warning text-[11px] py-0.5"><AlertCircle className="w-3 h-3" /> Partial</span>;
    case 'FAILED':
    case 'ERROR':
      return <span className="status-badge status-error text-[11px] py-0.5"><XCircle className="w-3 h-3" /> Fail</span>;
    default:
      return <span className="status-badge border-border text-foreground text-[11px] py-0.5">{status}</span>;
  }
};

