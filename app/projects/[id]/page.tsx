{activeTab === 'episodes' && (
  <EpisodeEditor 
    projectId={projectId} 
    episodes={project.episodes} 
    characters={project.characters}
  />
)} 