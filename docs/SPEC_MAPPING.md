# Spec Requirement Mapping (Java vs Python)

| Spec Requirement (Java Stack) | Our Implementation (Python Stack) | Justification |
| --- | --- | --- |
| **Java 21 + Spring Boot** | **Python 3 + FastAPI** | Python is the native ecosystem for AI and LLMs (Gemini). FastAPI provides async, high-performance orchestration. |
| **Spring MVC (Controllers)** | **FastAPI Routers (`app/controllers`)** | Maps 1:1. FastAPI routers handle request/response mapping and OpenAPI generation natively. |
| **Spring Data JPA / Hibernate** | **SQLAlchemy 2.x + Alembic** | SQLAlchemy provides enterprise-grade ORM patterns (Unit of Work, Repositories). Alembic handles migrations. |
| **MapStruct / Lombok (DTOs)** | **Pydantic v2 (`app/schemas`)** | Pydantic natively handles data validation, serialization, and typing without requiring boilerplate getters/setters or MapStruct code generation. |
| **Spring Security + JWT** | **`app/security` + python-jose + passlib** | Replicates RBAC (Role-Based Access Control) and OAuth2 Password bearer flows. Provides robust JWT management and password hashing. |
| **Swagger / OpenAPI** | **FastAPI Native OpenAPI** | FastAPI generates OpenAPI 3.0 specs and Swagger UI automatically out of the box based on Pydantic schemas. |
| **PostgreSQL** | **PostgreSQL (with SQLite fallback)** | PostgreSQL used for production data storage. We provide a SQLite fallback for seamless local development. |
| **Redis Cache** | **(Planned) Redis or in-memory cache** | Caching layers can be easily added to FastAPI for responses and rate limiting (via `slowapi`). |
| **JasperReports / iText** | **ReportLab / Pypdf / python-docx** | Python has rich libraries for document generation and manipulation, fitting the AI report pipeline naturally. |

## Justification
While the original specification called for a Java/Spring Boot stack, the core of PropIntel AI heavily relies on Artificial Intelligence (Gemini) orchestration, data science, and deterministic risk modeling. Python is the undisputed industry standard and native ecosystem for these tasks. 
By adopting an enterprise-layered architecture (Controllers, Services, Repositories) in FastAPI, we achieve the strict organizational structure, security, and scalability required by the Java specification, while preserving the immense developer velocity and AI integration capabilities of Python.
