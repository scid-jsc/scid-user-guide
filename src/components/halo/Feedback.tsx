import { useState } from 'react';
import clsx from 'clsx';

interface FeedbackProps {
  question?: string;
  sub?: string;
}

export default function Feedback({
  question = 'Trang này có hữu ích không?',
  sub = 'Phản hồi của Anh/Chị giúp Ban CNTT cải thiện tài liệu hướng dẫn.',
}: FeedbackProps) {
  const [picked, setPicked] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="hd-feedback" role="group" aria-label={question}>
      <div>
        <div className="hd-feedback-q">{question}</div>
        <div className="hd-feedback-sub">{sub}</div>
      </div>
      <div className="hd-feedback-actions">
        <button
          type="button"
          className={clsx('hd-feedback-btn', picked === 'yes' && 'is-picked')}
          onClick={() => setPicked('yes')}
          aria-pressed={picked === 'yes'}
        >
          👍 Có
        </button>
        <button
          type="button"
          className={clsx('hd-feedback-btn', picked === 'no' && 'is-picked')}
          onClick={() => setPicked('no')}
          aria-pressed={picked === 'no'}
        >
          👎 Chưa
        </button>
      </div>
    </div>
  );
}
