import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupaBaseTest() {
  const [title, setTitle] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInsert = async () => {
    if (!title.trim()) return alert('Please enter a title');

    const { error } = await supabase.from('narrative_projects').insert([{ title }]);

    if (error) {
      alert('Insert failed: ' + error.message);
    } else {
      setTitle('');
      await fetchProjects(); // Refresh table
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('narrative_projects')
      .select('id, title, tone, core_themes')
      .order('id', { ascending: true });

    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this project?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('narrative_projects').delete().eq('id', id);

    if (error) {
      alert('Delete failed: ' + error.message);
    } else {
      await fetchProjects(); // Refresh list after delete
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create Narrative Project</h2>
      <input
        type="text"
        placeholder="Enter project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleInsert} style={{ marginLeft: '1rem' }}>
        Save
      </button>

      <hr style={{ margin: '2rem 0' }} />

      <h3>My Narrative Projects</h3>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : projects.length > 0 && (
  <table style={{ marginTop: '2rem', width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th>Title</th>
        <th>Core Themes</th>
        <th>Tone</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {projects.map((proj) => (
        <tr key={proj.id}>
          <td>
            <input
              type="text"
              value={proj.title || ''}
              onChange={(e) =>
                setProjects((prev) =>
                  prev.map((p) =>
                    p.id === proj.id ? { ...p, title: e.target.value } : p
                  )
                )
              }
              style={{ width: '100%' }}
            />
          </td>
          <td>
            <input
              type="text"
              value={proj.core_themes || ''}
              onChange={(e) =>
                setProjects((prev) =>
                  prev.map((p) =>
                    p.id === proj.id ? { ...p, core_themes: e.target.value } : p
                  )
                )
              }
              style={{ width: '100%' }}
            />
          </td>
          <td>
            <input
              type="text"
              value={proj.tone || ''}
              onChange={(e) =>
                setProjects((prev) =>
                  prev.map((p) =>
                    p.id === proj.id ? { ...p, tone: e.target.value } : p
                  )
                )
              }
              style={{ width: '100%' }}
            />
          </td>
          <td>
            <button
              onClick={async () => {
                const { error } = await supabase
                  .from('narrative_projects')
                  .update({
                    title: proj.title,
                    tone: proj.tone,
                    core_themes: proj.core_themes,
                  })
                  .eq('id', proj.id);
                if (error) {
                  console.error('Update failed:', error.message);
                } else {
                  fetchProjects(); // Refresh with clean data from DB
                }
              }}
              style={{ marginRight: '0.5rem' }}
            >
              Save
            </button>
            <button
              onClick={async () => {
                const { error } = await supabase
                  .from('narrative_projects')
                  .delete()
                  .eq('id', proj.id);
                if (error) {
                  console.error('Delete failed:', error.message);
                } else {
                  fetchProjects();
                }
              }}
              style={{ color: 'red' }}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
    </div>
  );
}
