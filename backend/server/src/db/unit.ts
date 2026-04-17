// NO AI used here, but copied code from the CRUD Flightmanagement exercise and adjusted it


import BetterSqlite3 from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { DB } from "./database";

type RawStatement<TResult> = BetterSqlite3.Statement<unknown[], TResult>;
type RunResult = ReturnType<RawStatement<unknown>["run"]>;

export interface ITypedStatement<TResult = unknown, TParams = any> {
    readonly _params?: TParams;
    get(): TResult | undefined;
    all(): TResult[];
    run(): RunResult;
}

export class Unit {
    private readonly db: Database;
    private completed: boolean;

    public constructor(public readonly readOnly: boolean) {
        this.completed = false;
        this.db = DB.createDBConnection();

        if (!this.readOnly) {
            DB.beginTransaction(this.db);
        }
    }

    public prepare<TResult, TParams = any>(
        sql: string,
        bindings?: TParams
    ): ITypedStatement<TResult, TParams> {
        const stmt = this.db.prepare(sql);

        if (bindings != null) {
            if (Array.isArray(bindings)) {
                return {
                    get: () => stmt.get(...bindings) as TResult | undefined,
                    all: () => stmt.all(...bindings) as TResult[],
                    run: () => stmt.run(...bindings) as RunResult,
                } as ITypedStatement<TResult, TParams>;
            } else {
                return {
                    get: () => stmt.get(bindings) as TResult | undefined,
                    all: () => stmt.all(bindings) as TResult[],
                    run: () => stmt.run(bindings) as RunResult,
                } as ITypedStatement<TResult, TParams>;
            }
        }

        return stmt as unknown as ITypedStatement<TResult, TParams>;
    }

    public getLastRowId(): number {
        const stmt = this.prepare<{ id: number }>("SELECT last_insert_rowid() AS id");
        const result = stmt.get();

        if (!result) {
            throw new Error("Unable to retrieve last inserted row id");
        }

        return result.id;
    }

    public complete(commit: boolean | null = null): void {
        if (this.completed) {
            return;
        }

        this.completed = true;

        if (commit !== null) {
            if (!this.readOnly) {
                if (commit) {
                    DB.commitTransaction(this.db);
                } else {
                    DB.rollbackTransaction(this.db);
                }
            }
        } else if (!this.readOnly) {
            throw new Error("Transaction is open. You must explicitly commit or rollback.");
        }

    }
}