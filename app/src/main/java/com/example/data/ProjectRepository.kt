package com.example.data

import kotlinx.coroutines.flow.Flow

class ProjectRepository(private val projectDao: ProjectDao) {
  val allProjects: Flow<List<ProjectEntity>> = projectDao.getAllProjects()

  suspend fun insertProject(project: ProjectEntity): Long = projectDao.insertProject(project)

  suspend fun updateProject(project: ProjectEntity) = projectDao.updateProject(project)

  suspend fun deleteProject(project: ProjectEntity) = projectDao.deleteProject(project)

  suspend fun deleteProjectById(id: Long) = projectDao.deleteProjectById(id)

  suspend fun getProjectById(id: Long): ProjectEntity? = projectDao.getProjectById(id)
}
