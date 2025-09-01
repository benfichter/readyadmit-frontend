import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import NiceSelect from '../components/NiceSelect';


function normStatus(s = '') { return ['drafting','editing','submitted','accepted','rejected'].includes(s) ? s : 'drafting'; }


export function PrettyAIButton({ onClick, children }) {
return (
<button onClick={onClick} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm">
{children}
</button>
);
}


export default function ApplicationWorkspace() {
const { appId } = useParams();
const [app, setApp] = useState(null);
const [saving, setSaving] = useState(false);


useEffect(() => {
api.get(`/apps/${appId}`).then(({ data }) => setApp(data));
}, [appId]);


async function save(patch) {
setSaving(true);
const { data } = await api.patch(`/apps/${appId}`, patch);
setApp(data);
setSaving(false);
}


if (!app) return <div>Loading...</div>;


return (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h1 className="text-2xl font-semibold">{app.college || 'Untitled App'}</h1>
<div className="flex items-center gap-3">
<NiceSelect
value={app.status}
onChange={(s) => save({ status: normStatus(s) })}
options={[
{ value: 'drafting', label: 'Drafting' },
{ value: 'editing', label: 'Editing' },
{ value: 'submitted', label: 'Submitted' },
{ value: 'accepted', label: 'Accepted' },
{ value: 'rejected', label: 'Rejected' }
]}
/>
<PrettyAIButton onClick={() => alert('AI helper TBD')}>AI Helper</PrettyAIButton>
</div>
</div>


<section className="grid md:grid-cols-2 gap-4">
<div className="bg-white border rounded-xl p-4">
<h2 className="font-medium mb-2">Notes</h2>
<textarea
className="w-full h-48 border rounded-lg p-2"
defaultValue={app.notes || ''}
onBlur={(e) => save({ notes: e.target.value })}
/>
</div>
<div className="bg-white border rounded-xl p-4">
<h2 className="font-medium mb-2">Deadlines</h2>
<input
type="date"
className="border rounded-lg px-3 py-2"
defaultValue={app.deadline || ''}
onBlur={(e) => save({ deadline: e.target.value })}
/>
</div>
</section>
</div>
);
}